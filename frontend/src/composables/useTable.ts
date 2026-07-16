import { reactive, ref } from 'vue'

// 列表页通用逻辑：分页、查询、刷新
export function useTable(apiFn: (params: any) => Promise<any>) {
  const loading = ref(false)
  const list = ref<any[]>([])
  const total = ref(0)
  const query = reactive({
    pageNum: 1,
    pageSize: 20,
    filters: {} as Record<string, any>
  })

  async function getList() {
    loading.value = true
    try {
      const res = await apiFn({
        pageNum: query.pageNum,
        pageSize: query.pageSize,
        ...query.filters
      })
      list.value = res.list
      total.value = res.total
    } finally {
      loading.value = false
    }
  }

  function search() {
    query.pageNum = 1
    getList()
  }

  function reset() {
    query.pageNum = 1
    query.filters = {}
    getList()
  }

  function handleSizeChange(size: number) {
    query.pageSize = size
    getList()
  }

  function handleCurrentChange(page: number) {
    query.pageNum = page
    getList()
  }

  return {
    loading,
    list,
    total,
    query,
    getList,
    search,
    reset,
    handleSizeChange,
    handleCurrentChange
  }
}
