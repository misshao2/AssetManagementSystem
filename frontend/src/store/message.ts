import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface MessageItem {
  id: string
  title: string
  content: string
  businessType?: string
  createTime?: string
  read?: boolean
  [key: string]: any
}

export const useMessageStore = defineStore('message', () => {
  const unreadCount = ref(0)
  const list = ref<MessageItem[]>([])

  function setUnread(n: number) {
    unreadCount.value = n
  }

  function setList(l: MessageItem[]) {
    list.value = l
  }

  function markRead(id: string) {
    const item = list.value.find((m) => m.id === id)
    if (item) item.read = true
  }

  return { unreadCount, list, setUnread, setList, markRead }
})
