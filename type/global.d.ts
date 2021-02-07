declare module '*.less'

declare const ENV: 'prod' | 'dev'

interface Window {
  r: number
  users: IUser[]
  serviceWork: Promise<any>
}

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>
}

/** 接口返回数据格式 */
type ResponseData = {
  data: any[],
  pageNo: number
  pageSize: number
  /** 总数据量 */
  totalSize: number
}

interface IRoute {
  path?: string
  name?: string
  exact?: boolean
  /** for sidebar */
  parent?: this
  routes?: this[]
  /**
   * Element: 左侧栏显示的菜单
   * Boolean: 是否在左侧菜单栏中显示
   */
  menu?: JSX.Element | boolean
  component?: React.FunctionComponent
}

interface IUser {
  id: string
  name: string
}
