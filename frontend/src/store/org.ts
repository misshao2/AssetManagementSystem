import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '@/utils/storage'

export interface OrgNode {
  id: string
  name: string
  type?: string
  parentId?: string
  children?: OrgNode[]
  [key: string]: any
}

export const useOrgStore = defineStore(
  'org',
  () => {
    const orgTree = ref<OrgNode[]>([])
    const currentOrgId = ref<string>(storage.get<string>('asset_org') || '')

    function setCurrentOrg(id: string) {
      currentOrgId.value = id
      storage.set('asset_org', id)
    }

    function setOrgTree(tree: OrgNode[]) {
      orgTree.value = tree
    }

    return { orgTree, currentOrgId, setCurrentOrg, setOrgTree }
  },
  {
    persist: { paths: ['currentOrgId'] }
  }
)
