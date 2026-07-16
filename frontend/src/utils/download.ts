import { formatDate } from './format'

// 通过 Blob 下载
export function downloadByData(data: Blob, filename: string): void {
  const url = window.URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

// 通过 URL 下载
export function downloadByUrl(url: string, filename?: string): void {
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `download_${formatDate(new Date(), 'YYYYMMDDHHmmss')}`
  a.click()
}
