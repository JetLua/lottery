import 'antd/dist/antd.less'
import {ConfigProvider} from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import {hot} from 'react-hot-loader/root'
import {BrowserRouter, Switch, Route} from 'react-router-dom'

import './style.less'
import routes from './route'

const Router = ENV === 'prod' || ENV === 'github' ? BrowserRouter : hot(BrowserRouter)

// 统一表单错误提示
const validateMessages = {
  required: '${label}不能为空',
}

ReactDOM.render(
  <ConfigProvider locale={zhCN} form={{validateMessages}}><Router basename={`${ENV === 'github' ? '/lottery' : '/'}`}><Switch>
    <Route path="*" component={Main}></Route>
  </Switch></Router></ConfigProvider>,
  document.querySelector('.layout')
)

function Main(props) {
  return <section className="main h-100">
    <Switch>{map(routes)}</Switch>
  </section>
}

function map(routes: IRoute[]) {
  // 拍平路由利于嵌套匹配
  const queue = flat(routes)

  return queue.map((item: IRoute, i: number) => {
    if (!item.path) return
    return <Route key={i} path={item.path} component={item.component} exact={item.exact ?? true}/>
  })
}

function flat(routes: IRoute[]) {
  const queue = []
  for (const route of routes) {
    queue.push(route)
    if (route.routes) queue.push(...flat(route.routes))
  }
  return queue
}

if (navigator.serviceWorker) {
  navigator.serviceWorker.register('sw.js', {scope: ENV === 'github' ? '/lottery/' : '/'}).then(registration => {
    registration.addEventListener('updatefound', () => {
      const {installing} = registration
      installing.onstatechange = async () => {
        // 只能刷新
        registration.active?.state === 'activated' && location.reload()
      }
    })
  })
}

// 给个类似Mac的滚动条
if (!navigator.userAgent.toLowerCase().includes('mac')) {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `${ENV === 'github' ? '/lottery' : ''}/static/css/scrollbar.css`
  document.head.appendChild(link)
}
