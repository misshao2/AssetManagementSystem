// 本地存储封装（JSON 序列化）
export const storage = {
  get<T = any>(key: string): T | null {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return raw as unknown as T
    }
  },
  set(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value))
  },
  remove(key: string): void {
    localStorage.removeItem(key)
  }
}
