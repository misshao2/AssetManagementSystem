import dayjs from 'dayjs'

export function formatDate(value?: string | number | Date, fmt = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!value) return '-'
  return dayjs(value).format(fmt)
}

export function formatMoney(value?: number, digits = 2): string {
  if (value == null || isNaN(value)) return '-'
  return (
    '¥' +
    Number(value).toLocaleString('zh-CN', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    })
  )
}

export function formatArea(value?: number): string {
  if (value == null) return '-'
  return `${value.toLocaleString('zh-CN')} ㎡`
}
