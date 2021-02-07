import {message} from 'antd'

import {loader, screen} from '~/core'
import {createPromise, net} from '~/util'
import {init} from './particle'

export default async function() {
  const [promise, resolve] = createPromise()

  const data = await getUsers()

  if (data) {
    for (const item of data) {
      loader.add(item.id, `/static/avatar/${item.id}.png`)
    }
  }

  loader.load(resolve)

  await promise

  init(data)
}

async function getUsers(): Promise<IUser[]> {
  let data: any = await net.get('/api/user/list').catch(console.log)
  console.log(data)
  if (!data) return
  window.users = data
  return data
}
