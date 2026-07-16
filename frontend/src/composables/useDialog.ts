import { ref } from 'vue'

export function useDialog() {
  const visible = ref(false)
  const submitting = ref(false)

  function open() {
    visible.value = true
  }

  function close() {
    visible.value = false
  }

  return { visible, submitting, open, close }
}
