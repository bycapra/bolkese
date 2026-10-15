import { request } from './client'

export function fetchLookups() {
  return request('/api/lookups')
}
