function escapeCsvField(value) {
  const text = String(value ?? '')
  if (/[;"\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`
  }
  return text
}

export function toCsv(headers, records) {
  const lines = [
    headers.map(escapeCsvField).join(';'),
    ...records.map((record) => record.map(escapeCsvField).join(';')),
  ]
  return `\uFEFF${lines.join('\r\n')}\r\n`
}

export function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
