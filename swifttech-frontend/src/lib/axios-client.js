import axios from 'axios'

export function createAxiosClient({ baseURL, token }) {
  const client = axios.create({
    baseURL,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  })

  // Optional: interceptors for logging or error handling
  client.interceptors.response.use(
    response => response,
    error => {
      console.error('Axios error:', error)
      return Promise.reject(error)
    }
  )

  return client
}
