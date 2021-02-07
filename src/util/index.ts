import merge from './merge'

const agent = navigator.userAgent.toLowerCase()

export function isWechat() {
  return agent.includes('micromessenger')
}

export function isMobile() {
  return agent.includes('mobile')
}

export function isAndroid() {
  return agent.includes('android')
}

export function isIOS() {
  return agent.includes('iphone')
}

/**
 * 延迟函数
 * @param {number} t 延迟时间，单位秒
 */
export function delay(t: number = 0) {
  return new Promise(resolve => {
    setTimeout(resolve, t * 1e3)
  })
}

export function debounce(fn: Function): (t?: number) => void {
  let id: number
  return function(t: number) {
    clearTimeout(id)
    t ? id = setTimeout(fn, t * 1e3) : fn()
  }
}

/**
 * 无依赖挂载
 * https://zhuanlan.zhihu.com/p/86211675
 */
export function useMount(fn: Function) {
  const ref = React.useRef<Function>()
  ref.current = fn
  React.useEffect(() => {
    ref.current()
  }, [])
}

export function useReducer<T>(state: T) {
  return React.useReducer(
    (state: T, data: RecursivePartial<T>) => ({...merge<T>(state, data)}),
    state
  )
}

export {merge}
export {default as net} from './net'
export {default as store} from './store'
export {default as createPromise} from './createPromise'
