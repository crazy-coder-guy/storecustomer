const SIZE_CODE_MAP: Record<string, string> = {
  small: 'S',
  medium: 'M',
  large: 'L',
  'extra large': 'XL',
  xlarge: 'XL',
  'double extra large': '2XL',
  '2xlarge': '2XL',
  xxl: '2XL',
  'triple extra large': '3XL',
  '3xlarge': '3XL',
  xxxl: '3XL',
  'extra small': 'XS',
  xsmall: 'XS',
}

export function formatSizeCode(size: string | undefined | null): string {
  if (!size) return ''
  const trimmed = size.trim()
  const lower = trimmed.toLowerCase()
  return SIZE_CODE_MAP[lower] ?? trimmed
}
