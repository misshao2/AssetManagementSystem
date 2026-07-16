import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/store/user'

// v-permission 指令：无权限时移除 DOM
export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const userStore = useUserStore()
    const need = binding.value
    const required: string[] = Array.isArray(need) ? need : [need]
    const has = required.some((p) => userStore.permissions.includes(p))
    if (!has && el.parentNode) {
      el.parentNode.removeChild(el)
    }
  }
}
