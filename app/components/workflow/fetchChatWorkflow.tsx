import { get } from '@/service/base'

export const fetchNow = () => {
  return get<{ url: string }>('/app-conversation-list/now')
}
