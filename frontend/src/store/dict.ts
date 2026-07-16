import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getDict as getDictApi } from '@/api/system'

export interface DictItem {
  label: string
  value: string
  [key: string]: any
}

export const useDictStore = defineStore(
  'dict',
  () => {
    const dictMap = ref<Record<string, DictItem[]>>({})

    async function loadDict(type: string): Promise<DictItem[]> {
      if (!dictMap.value[type]) {
        dictMap.value[type] = await getDictApi(type)
      }
      return dictMap.value[type]
    }

    function getDict(type: string): DictItem[] {
      return dictMap.value[type] || []
    }

    function getLabel(type: string, value: string): string {
      return getDict(type).find((d) => d.value === value)?.label || value
    }

    return { dictMap, loadDict, getDict, getLabel }
  },
  {
    persist: { paths: ['dictMap'] }
  }
)
