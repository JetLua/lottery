import {Button, Form, Input, Modal, Divider, message} from 'antd'
import {PlusCircleTwoTone, DeleteTwoTone} from '@ant-design/icons'

import {createPromise, useReducer, net, store} from '~/util'
import style from './style.less'
import type {Avatar} from '../game/particle'

type Status = 'started' | 'paused' | 'ended'

export default React.memo<any>(React.forwardRef<any>(function(props, ref: React.MutableRefObject<IToolbar>) {
  const [state, dispatch] = useReducer({
    started: false,
    status: 'ended' as Status,
    net: {lottery: false},
    award: '',
    exclude: [] as string[],
    configs: [] as {name: string, amount: number, time: number}[]
  })

  const immut = React.useRef<{
    dialog: IDialog,
    record: IRecord,
    stop?: Function
    go?: Function
  }>({
    record: {},
    dialog: {
      submit(data, save = true) {
        save ? dispatch({configs: data}) : dispatch({configs: data, exclude: []})
        immut.current.dialog.hide()
      }
    }
  })

  const onClick = async (e: React.MouseEvent<HTMLElement>) => {
    const dataset = e.currentTarget.dataset
    switch (dataset.id) {
      case 'btn:config': {
        immut.current.dialog.show('抽奖配置')
        break
      }

      case 'btn:stop': {
        immut.current.stop()
        break
      }

      case 'btn:go': {
        immut.current.go()
        dispatch({status: 'started'})
        break
      }

      case 'btn:start': {
        let {name, amount, time} = state.configs.shift()
        const average = amount / time | 0

        dispatch({award: name})

        !async function loop() {
          dispatch({status: 'started'})
          ref.current.lottery()
          let [promise, resolve] = createPromise()
          immut.current.stop = resolve
          const total = time > 1 ? average : amount
          dispatch({net: {lottery: true}})

          const users = await net.post('/api/lottery', {
            pickerNum: total,
            excludeEmpNos: state.exclude
          }).catch(err => message.error(err.message))

          const _users = store.record.find(item => item.name === name)?.users

          _users ? _users.push(...users) : store.record.push({name, users})

          dispatch({
            exclude: users.map(item => item.id),
            net: {lottery: false}
          })

          await promise

          const avatars = await ref.current.congratulate(users)

          dispatch({status: 'paused'})

          {[promise, resolve] = createPromise()}

          immut.current.go = resolve

          // 带等待继续
          await promise

          ref.current.go(avatars)

          time--
          amount -= average
          if (time) return loop()
          ref.current.normal()
          dispatch({status: 'ended', award: ''})
        }()

        break
      }

      case 'btn:record': {
        immut.current.record.show(store.record ?? [])
        break
      }
    }
  }

  const startable = !!state.configs.length

  return <section className={style.root}>
    <div className={style.award}>{state.award}</div>
    <div className={style['btn-group']}>
      {state.status === 'paused' && <Button type="primary" size="large" onClick={onClick} data-id="btn:go">继续</Button>}
      {state.status === 'started' && <Button type="primary" size="large" onClick={onClick} data-id="btn:stop">停</Button>}
      {state.status === 'ended' && startable && <Button type="primary" size="large" onClick={onClick} data-id="btn:start">开始抽奖</Button>}
      {!startable && state.status === 'ended' && !state.net.lottery && <Button size="large" type="primary" onClick={onClick} data-id="btn:config">抽奖配置</Button>}
      <Button type="primary" onClick={onClick} size="large" data-id="btn:record">中奖记录</Button>
    </div>
    <Dialog ref={immut}/>
    <Record ref={immut}/>
  </section>
}))

const Dialog = React.memo(React.forwardRef<any>(function(props, ref: React.MutableRefObject<{dialog: IDialog}>) {
  const [state, dispatch] = useReducer({
    title: '',
    visible: false
  })

  const [form] = Form.useForm()

  const onOk = (save?: boolean) => {
    form.validateFields().then(() => {
      const data = form.getFieldsValue()
      if (!data.names) return dispatch({visible: false})
      ref.current.dialog.submit(data.names.map(({amount, time, name}) => {
        name = name.trim()
        time = +(time.trim())
        amount = +(amount.trim())
        return {name, amount, time}
      }), save)
    })
  }

  const onCancel = () => {
    ref.current.dialog.hide()
  }

  ref.current.dialog.show = (title: string) => {
    dispatch({visible: true, title})
  }

  ref.current.dialog.hide = () => {
    dispatch({visible: false})
  }

  const footer = <section>
    <Button onClick={() => onOk(true)}>确定(保留记录)</Button>
    <Button onClick={() => onOk()} type="primary">确定</Button>
  </section>

  return <Modal
    bodyStyle={{maxHeight: '500px', overflow: 'auto'}}
    onCancel={onCancel}
    destroyOnClose
    title={state.title}
    maskClosable={false}
    visible={state.visible}
    footer={footer}
  >
    <Form labelCol={{span: 6}} wrapperCol={{span: 18}} form={form}
      className={style.form}
    >
      <Form.List name="names">
        {(fields, {add, remove}) => {
          return <React.Fragment>
            {fields.map((item, i) => {
              return <React.Fragment key={item.key}>
                <Divider>奖项 {i + 1} <Button type="link" onClick={() => remove(item.name)} icon={<DeleteTwoTone/>}></Button></Divider>
                <Form.Item label="奖品" name={[item.name, 'name']} rules={[{required: true}]}>
                  <Input/>
                </Form.Item>
                <Form.Item validateFirst label="中奖人数" name={[item.name, 'amount']}
                  rules={[
                    {required: true},
                    {pattern: /^[1-9]\d*$/, message: '请输入大于 0 的整数'},
                    ({getFieldValue}) => ({
                      validator(_, v) {
                        const {time} = getFieldValue('names')[i]
                        if (!time) return Promise.resolve()
                        if (+v < +time) return Promise.reject('中奖人数不能小于抽奖次数')
                        const error = form.getFieldError(['names', item.name, 'time']).length
                        error && form.validateFields([['names', item.name, 'time']])
                        return Promise.resolve()
                      }
                    })
                  ]}
                >
                  <Input/>
                </Form.Item>
                <Form.Item validateFirst label="抽奖次数" name={[item.name, 'time']}
                  rules={[
                    {required: true},
                    {pattern: /^[1-9]\d*$/, message: '请输入大于 0 的整数'},
                    ({getFieldValue}) => ({
                      validator(_, v) {
                        const {amount} = getFieldValue('names')[i]
                        if (!amount) return Promise.resolve()
                        if (+v > +amount) return Promise.reject('抽奖次数不能大于中奖人数')
                        const error = form.getFieldError(['names', item.name, 'amount']).length
                        error && form.validateFields([['names', item.name, 'amount']])
                        return Promise.resolve()
                      }
                    })
                  ]}
                  initialValue="1"
                >
                  <Input/>
                </Form.Item>
              </React.Fragment>
            })}
            <Form.Item label=" " colon={false}>
              <Button icon={<PlusCircleTwoTone/>} onClick={add}>添加奖品</Button>
            </Form.Item>
          </React.Fragment>
        }}
      </Form.List>
    </Form>
  </Modal>
}))

interface IDialog {
  show?(title: string): void
  hide?(): void
  submit?(data: IConfig[], save?: boolean): void
}

interface IConfig {
  name: string
  amount: number
}

export interface IToolbar {
  lottery(): void
  normal(): void
  go(avatars: Avatar[]): void
  congratulate(ids: IUser[]): Promise<Avatar[]>
}

const Record = React.memo(React.forwardRef<any>(function(props, ref: React.MutableRefObject<{record: IRecord}>) {
  const [state, dispatch] = useReducer({
    data: [] as typeof store.record,
    visible: false
  })

  ref.current.record.show = data => {
    dispatch({visible: true, data})
  }

  const onCancel = () => {
    dispatch({visible: false})
  }

  return <Modal
    destroyOnClose
    title="中奖纪录"
    visible={state.visible}
    maskClosable={false}
    width={800}
    onCancel={onCancel}
    footer={null}
    className={[style.modal, style.record].join(' ')}
    bodyStyle={{maxHeight: '500px', overflow: 'auto'}}
  >
    {
      state.data.map((item, i) => {
        return <React.Fragment key={i}>
          <Divider>{item.name}</Divider>
          <section className={style.list}>
            {
              item.users.map((user, j) => {
                return <div key={j}>{user.name}</div>
              })
            }
          </section>
        </React.Fragment>
      })
    }
  </Modal>
}))

interface IRecord {
  show?(data: typeof store.record): void
  hide?(): void
}
