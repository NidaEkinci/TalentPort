import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || ''
})

// Her istekte localStorage'daki token'ı header'a ekle
API.interceptors.request.use(config => {
  const stored = localStorage.getItem('tp_user')
  if (stored) {
    const { token } = JSON.parse(stored)
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const getJobs = (params) => API.get('/api/jobs', { params })
export const getJob  = (id) => API.get(`/api/jobs/${id}`)
export const applyJob = (data) => API.post('/api/apply', data)
export const registerUser = (data) => API.post('/api/register', data)
export const loginUser = (data) => API.post('/api/login', data)
export const getMyApplications = () => API.get('/api/my-applications')
export const parseCv = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return axios.post('http://localhost:8001/api/parse-cv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}