import {message} from 'antd'

import {useMount} from '~/util'
import style from './style.less'
import Toolbar from './toolbar'
import type {IToolbar} from './toolbar'

window.r = 14

export default React.memo(function() {

  const immut = React.useRef<{
    go?: IToolbar['go']
    normal?: IToolbar['normal']
    lottery?: IToolbar['lottery']
    congratulate?: IToolbar['congratulate']
  }>({})

  useMount(async () => {
    const {preload, init, lottery, congratulate, normal, go} = await import('./game')
    message.loading({content: '加载资源', duration: 0, key: 1})
    console.log('load')
    await preload()
    init()
    immut.current.go = go
    immut.current.lottery = lottery
    immut.current.normal = normal
    immut.current.congratulate = congratulate
    message.destroy(1)
  })

  return <section className={style.root}>
    <canvas></canvas>
    <Toolbar ref={immut}/>
  </section>
})
