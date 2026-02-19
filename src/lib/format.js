// Schweizer Zahlenformat (de-CH): 1'000.00
const chfFormatter = new Intl.NumberFormat('de-CH', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const chfDecimalFormatter = new Intl.NumberFormat('de-CH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const percentFormatter = new Intl.NumberFormat('de-CH', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function formatNumber(value) {
  return chfFormatter.format(value || 0)
}

export function formatCHF(value) {
  return `CHF ${chfDecimalFormatter.format(value || 0)}`
}

export function formatPercent(value) {
  return `${percentFormatter.format(value || 0)}%`
}

// Monatsnamen Deutsch
const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
]

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
]

export function getMonthName(month) {
  return MONTHS[month - 1] || ''
}

export function getMonthShort(month) {
  return MONTHS_SHORT[month - 1] || ''
}

// Zeitstempel formatieren
export function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
