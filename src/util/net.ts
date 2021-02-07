import axios from 'axios'

const baseURL = '/'

const fetch = axios.create({
  baseURL
})


fetch.interceptors.response.use(
  async ({data}) => {
    if (!data.ok) return Promise.reject(new Error(data.msg))
    return data.data
  },

  async ({response: {data}}) => {
    return Promise.reject(new Error(data?.msg ?? data))
  }
)

export default fetch
