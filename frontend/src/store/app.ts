import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface TagView {
  path: string
  title: string
}

export const useAppStore = defineStore(
  'app',
  () => {
    const sidebarCollapsed = ref(false)
    const theme = ref<'light' | 'dark'>('light')
    const tagsView = ref<TagView[]>([])

    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    function setTheme(t: 'light' | 'dark') {
      theme.value = t
      document.documentElement.classList.toggle('dark', t === 'dark')
    }

    function addTag(tag: TagView) {
      if (!tagsView.value.find((t) => t.path === tag.path)) {
        tagsView.value.push(tag)
      }
    }

    function removeTag(path: string) {
      tagsView.value = tagsView.value.filter((t) => t.path !== path)
    }

    function clearTags() {
      tagsView.value = []
    }

    return { sidebarCollapsed, theme, tagsView, toggleSidebar, setTheme, addTag, removeTag, clearTags }
  },
  {
    persist: { paths: ['theme', 'sidebarCollapsed'] }
  }
)
