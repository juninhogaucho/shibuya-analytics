export interface CsvRescueResult {
  file: File
  applied: boolean
  notes: string[]
}

type CanonicalField = 'timestamp' | 'exit_time' | 'Symbol' | 'size' | 'pnl'
type Delimiter = ',' | ';' | '\t' | '|'
type RawRecord = Record<string, string>

const REQUIRED_HEADERS: CanonicalField[] = ['timestamp', 'exit_time', 'Symbol', 'size', 'pnl']
const DELIMITER_LABELS: Record<Delimiter, string> = {
  ',': 'comma',
  ';': 'semicolon',
  '\t': 'tab',
  '|': 'pipe',
}

const DIRECT_HEADER_ALIASES: Record<string, CanonicalField> = {
  timestamp: 'timestamp',
  datetime: 'timestamp',
  'trade datetime': 'timestamp',
  'trade date time': 'timestamp',
  'trade date/time': 'timestamp',
  date: 'timestamp',
  time: 'timestamp',
  'trade date': 'timestamp',
  'trade time': 'timestamp',
  'entry time': 'timestamp',
  entry_time: 'timestamp',
  'open time': 'timestamp',
  open_time: 'timestamp',
  opentime: 'timestamp',
  'order time': 'timestamp',
  'fill time': 'timestamp',
  'exit time': 'exit_time',
  exit_time: 'exit_time',
  'close time': 'exit_time',
  close_time: 'exit_time',
  closetime: 'exit_time',
  'square off time': 'exit_time',
  symbol: 'Symbol',
  tradingsymbol: 'Symbol',
  'trading symbol': 'Symbol',
  instrument: 'Symbol',
  'instrument name': 'Symbol',
  ticker: 'Symbol',
  pair: 'Symbol',
  contract: 'Symbol',
  scrip: 'Symbol',
  security: 'Symbol',
  size: 'size',
  lot: 'size',
  lots: 'size',
  'lot size': 'size',
  volume: 'size',
  quantity: 'size',
  qty: 'size',
  'trade qty': 'size',
  'filled qty': 'size',
  'filled quantity': 'size',
  'position size': 'size',
  pnl: 'pnl',
  profit: 'pnl',
  'profit/loss': 'pnl',
  profit_loss: 'pnl',
  'p/l': 'pnl',
  'p&l': 'pnl',
  'net profit': 'pnl',
  net_profit: 'pnl',
  result: 'pnl',
  gain: 'pnl',
  'gain/loss': 'pnl',
  'realized pnl': 'pnl',
  'realised pnl': 'pnl',
  'realized p&l': 'pnl',
  'realised p&l': 'pnl',
  'realized p/l': 'pnl',
  'realised p/l': 'pnl',
  'net pnl': 'pnl',
  'net p&l': 'pnl',
  'net p/l': 'pnl',
  'closed pnl': 'pnl',
  // India broker specifics — Zerodha, Angel One, Dhan, Upstox, FYERS
  'order date': 'timestamp',
  'order_date': 'timestamp',
  'execution time': 'timestamp',
  'execution_time': 'timestamp',
  'fill date': 'timestamp',
  'settlement date': 'timestamp',
  'trade no': 'timestamp', // Zerodha contract note marker — keep as anchor
  'order no': 'timestamp',
  'square off date': 'exit_time',
  'sell time': 'exit_time',
  'exit date': 'exit_time',
  scrip_name: 'Symbol',
  'scrip name': 'Symbol',
  'scrip code': 'Symbol',
  script: 'Symbol',
  isin: 'Symbol',
  'stock name': 'Symbol',
  'stock symbol': 'Symbol',
  'option type': 'Symbol',
  'strike price': 'Symbol',
  'contract description': 'Symbol',
  'buy qty': 'size',
  buy_qty: 'size',
  'sell qty': 'size',
  sell_qty: 'size',
  'net qty': 'size',
  net_qty: 'size',
  'total quantity': 'size',
  'total qty': 'size',
  'executed qty': 'size',
  'order qty': 'size',
  'total traded quantity': 'size',
  'market lot': 'size',
  'net amount': 'pnl',
  'net_amount': 'pnl',
  'realised profit': 'pnl',
  'realised_profit': 'pnl',
  'net realised profit': 'pnl',
  'booked profit': 'pnl',
  'booked_profit': 'pnl',
  'trade pnl': 'pnl',
  'trade_pnl': 'pnl',
  'closing balance': 'pnl',
  'mtm': 'pnl',
  'mark to market': 'pnl',
}

const SYMBOL_KEYS = [
  'symbol',
  'tradingsymbol',
  'trading symbol',
  'instrument',
  'instrument name',
  'ticker',
  'pair',
  'asset',
  'market',
  'contract',
  'contract symbol',
  'description',
  'security',
  'scrip',
]

const SIZE_KEYS = [
  'size',
  'lot',
  'lots',
  'lot size',
  'volume',
  'quantity',
  'qty',
  'trade qty',
  'filled qty',
  'filled quantity',
  'position size',
]

const PNL_KEYS = [
  'pnl',
  'profit',
  'profit/loss',
  'profit_loss',
  'p/l',
  'p&l',
  'net profit',
  'net pnl',
  'net p&l',
  'net p/l',
  'result',
  'gain',
  'gain/loss',
  'realized pnl',
  'realised pnl',
  'realized p&l',
  'realised p&l',
  'realized p/l',
  'realised p/l',
  'closed pnl',
]

const ENTRY_DATE_KEYS = ['entry date', 'entry_date', 'open date', 'open_date', 'trade date', 'order date', 'date']
const ENTRY_TIME_KEYS = ['entry time', 'entry_time', 'open time', 'open_time', 'trade time', 'order time', 'time']
const EXIT_DATE_KEYS = ['exit date', 'close date', 'close_date', 'square off date']
const EXIT_TIME_KEYS = ['exit time', 'exit_time', 'close time', 'close_time', 'square off time']
const TIMESTAMP_KEYS = ['timestamp', 'datetime', 'trade datetime', 'trade date/time', 'trade date time']
const EXIT_TIMESTAMP_KEYS = ['exit_time', 'close datetime', 'close date/time', 'close date time']

const LEDGER_NOISE_PATTERNS = [
  /brokerage/i,
  /charges?/i,
  /tax/i,
  /gst/i,
  /stamp/i,
  /sebi/i,
  /turnover/i,
  /opening balance/i,
  /closing balance/i,
  /deposit/i,
  /withdraw/i,
  /fund transfer/i,
  /interest/i,
]

function parseDelimitedLine(line: string, delimiter: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === delimiter && !inQuotes) {
      result.push(current)
      current = ''
      continue
    }

    current += char
  }

  result.push(current)
  return result
}

function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

function normalizeHeaderKey(header: string): string {
  return header
    .replaceAll('\ufeff', '')
    .trim()
    .toLowerCase()
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\s+/g, ' ')
}

function detectDelimiter(lines: string[]): Delimiter {
  const candidates: Delimiter[] = [',', ';', '\t', '|']
  const sample = lines.slice(0, Math.min(5, lines.length))
  let best: { delimiter: Delimiter; score: number } = { delimiter: ',', score: -1 }

  for (const delimiter of candidates) {
    const counts = sample.map((line) => parseDelimitedLine(line, delimiter).length)
    const meaningful = counts.filter((count) => count > 1)
    if (meaningful.length === 0) {
      continue
    }

    const first = meaningful[0]
    const consistency = meaningful.filter((count) => count === first).length
    const average = meaningful.reduce((sum, count) => sum + count, 0) / meaningful.length
    const score = average * 10 + consistency

    if (score > best.score) {
      best = { delimiter, score }
    }
  }

  return best.delimiter
}

function padOrTrimValues(values: string[], targetLength: number): { values: string[]; padded: boolean; trimmed: boolean } {
  if (values.length === targetLength) {
    return { values, padded: false, trimmed: false }
  }

  if (values.length < targetLength) {
    return {
      values: [...values, ...Array.from({ length: targetLength - values.length }, () => '')],
      padded: true,
      trimmed: false,
    }
  }

  return {
    values: values.slice(0, targetLength),
    padded: false,
    trimmed: true,
  }
}

function buildRecords(lines: string[], delimiter: Delimiter): {
  headers: string[]
  records: RawRecord[]
  paddedRows: number
  trimmedRows: number
} {
  const headers = parseDelimitedLine(lines[0], delimiter).map((header) => header.trim())
  const headerKeys = headers.map((header) => normalizeHeaderKey(header))
  const records: RawRecord[] = []
  let paddedRows = 0
  let trimmedRows = 0

  for (const line of lines.slice(1)) {
    const rawValues = parseDelimitedLine(line, delimiter)
    const { values, padded, trimmed } = padOrTrimValues(rawValues, headers.length)
    paddedRows += padded ? 1 : 0
    trimmedRows += trimmed ? 1 : 0

    const record: RawRecord = {}
    values.forEach((value, index) => {
      const key = headerKeys[index]
      if (!key) {
        return
      }
      const trimmedValue = value.trim()
      if (!(key in record) || !record[key]) {
        record[key] = trimmedValue
      }
    })

    if (Object.values(record).some((value) => value.length > 0)) {
      records.push(record)
    }
  }

  return { headers, records, paddedRows, trimmedRows }
}

function pickFirst(record: RawRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key]
    if (value && value.trim()) {
      return value.trim()
    }
  }
  return ''
}

function combineDateAndTime(dateValue: string, timeValue: string): string {
  const datePart = dateValue.trim()
  const timePart = timeValue.trim()

  if (!datePart && !timePart) {
    return ''
  }

  if (!datePart) {
    return timePart
  }

  if (!timePart || /\d{1,2}:\d{2}/.test(datePart)) {
    return datePart
  }

  return `${datePart} ${timePart}`.trim()
}

function sanitizeNumeric(value: string): { value: string; changed: boolean } {
  const trimmed = value.trim()
  if (!trimmed) {
    return { value: '', changed: false }
  }

  let normalized = trimmed
  let changed = false

  if (normalized.includes('(') && normalized.includes(')')) {
    normalized = `-${normalized.replace(/[()]/g, '')}`
    changed = true
  }

  const stripped = normalized
    .replace(/₹|rs\.?|inr/gi, '')
    .replace(/,/g, '')
    .replace(/\s+/g, '')

  let signAdjusted = stripped
  const creditDebitMatch = signAdjusted.match(/^(.*?)(cr|dr)$/i)
  if (creditDebitMatch) {
    const [, numericPart, balanceTag] = creditDebitMatch
    signAdjusted = numericPart
    if (balanceTag.toLowerCase() === 'dr' && !numericPart.startsWith('-')) {
      signAdjusted = `-${numericPart}`
    }
    changed = true
  }

  if (signAdjusted !== normalized) {
    changed = true
  }

  const numericMatch = signAdjusted.match(/^-?[0-9]*\.?[0-9]+$/)
  if (numericMatch) {
    return { value: signAdjusted, changed }
  }

  return { value: trimmed, changed: false }
}

function sanitizeSymbol(value: string): string {
  return value.trim().replace(/\s+/g, '').toUpperCase()
}

function extractTimestamp(record: RawRecord): { value: string; rebuilt: boolean } {
  const direct = pickFirst(record, TIMESTAMP_KEYS)
  if (direct) {
    return { value: direct, rebuilt: false }
  }

  const entryDate = pickFirst(record, ENTRY_DATE_KEYS)
  const entryTime = pickFirst(record, ENTRY_TIME_KEYS)
  const combined = combineDateAndTime(entryDate, entryTime)
  return { value: combined, rebuilt: combined.length > 0 }
}

function extractExitTime(record: RawRecord, timestamp: string): { value: string; rebuilt: boolean; mirrored: boolean } {
  const direct = pickFirst(record, EXIT_TIMESTAMP_KEYS)
  if (direct) {
    return { value: direct, rebuilt: false, mirrored: false }
  }

  const exitDate = pickFirst(record, EXIT_DATE_KEYS)
  const exitTime = pickFirst(record, EXIT_TIME_KEYS)
  const combined = combineDateAndTime(exitDate, exitTime)
  if (combined) {
    return { value: combined, rebuilt: true, mirrored: false }
  }

  if (timestamp) {
    return { value: timestamp, rebuilt: false, mirrored: true }
  }

  return { value: '', rebuilt: false, mirrored: false }
}

function buildCanonicalRow(record: RawRecord): {
  row: Record<CanonicalField, string>
  rebuiltTimestamp: boolean
  rebuiltExitTime: boolean
  mirroredExitTime: boolean
  numericSanitized: boolean
} {
  const timestampResult = extractTimestamp(record)
  const exitTimeResult = extractExitTime(record, timestampResult.value)
  const pnlResult = sanitizeNumeric(pickFirst(record, PNL_KEYS))
  const sizeResult = sanitizeNumeric(pickFirst(record, SIZE_KEYS))

  return {
    row: {
      timestamp: timestampResult.value,
      exit_time: exitTimeResult.value,
      Symbol: sanitizeSymbol(pickFirst(record, SYMBOL_KEYS)),
      size: sizeResult.value,
      pnl: pnlResult.value,
    },
    rebuiltTimestamp: timestampResult.rebuilt,
    rebuiltExitTime: exitTimeResult.rebuilt,
    mirroredExitTime: exitTimeResult.mirrored,
    numericSanitized: pnlResult.changed || sizeResult.changed,
  }
}

function isLedgerNoise(record: RawRecord, row: Record<CanonicalField, string>): boolean {
  const rawText = Object.values(record).join(' ').trim()
  const symbol = row.Symbol.toLowerCase()

  if (symbol && LEDGER_NOISE_PATTERNS.some((pattern) => pattern.test(symbol))) {
    return true
  }

  return rawText.length > 0 && LEDGER_NOISE_PATTERNS.some((pattern) => pattern.test(rawText))
}

function hasRequiredValues(row: Record<CanonicalField, string>): boolean {
  return REQUIRED_HEADERS.every((header) => Boolean(row[header]?.trim()))
}

function buildOutputText(rows: Array<Record<CanonicalField, string>>): string {
  const header = REQUIRED_HEADERS.join(',')
  const body = rows.map((row) =>
    REQUIRED_HEADERS.map((column) => escapeCsvValue(row[column] ?? '')).join(','),
  )
  return [header, ...body].join('\n')
}

function detectSourceHint(fileName: string, headers: string[]): string | null {
  const haystack = `${fileName} ${headers.join(' ')}`.toLowerCase()

  if (haystack.includes('zerodha') || haystack.includes('kite')) {
    return 'Detected likely source: Zerodha / Kite export.'
  }
  if (haystack.includes('dhan')) {
    return 'Detected likely source: Dhan export.'
  }
  if (haystack.includes('angel')) {
    return 'Detected likely source: Angel One export.'
  }
  if (haystack.includes('upstox')) {
    return 'Detected likely source: Upstox export.'
  }
  if (haystack.includes('fyers')) {
    return 'Detected likely source: FYERS export.'
  }
  if (haystack.includes('mt5') || haystack.includes('metatrader 5')) {
    return 'Detected likely source: MT5 export.'
  }
  if (haystack.includes('mt4') || haystack.includes('metatrader 4')) {
    return 'Detected likely source: MT4 export.'
  }
  if (
    haystack.includes('trade date') &&
    haystack.includes('trade time') &&
    (haystack.includes('realised p&l') || haystack.includes('realized p&l'))
  ) {
    return 'Detected likely source: contract-note style export.'
  }

  return null
}

export async function rescueCsvForUpload(file: File): Promise<CsvRescueResult> {
  const originalText = (await file.text()).replace(/^\ufeff/, '')
  const lines = originalText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length === 0) {
    return { file, applied: false, notes: [] }
  }

  const delimiter = detectDelimiter(lines)
  const { headers, records, paddedRows, trimmedRows } = buildRecords(lines, delimiter)
  const notes: string[] = []
  const mappedNotes = new Set<string>()
  let rebuiltTimestampCount = 0
  let rebuiltExitTimeCount = 0
  let mirroredExitTimeCount = 0
  let numericSanitizedCount = 0
  let droppedNoiseCount = 0
  let droppedIncompleteCount = 0

  headers.forEach((header) => {
    const normalized = normalizeHeaderKey(header)
    const mapped = DIRECT_HEADER_ALIASES[normalized]
    if (mapped && mapped !== header.trim()) {
      mappedNotes.add(`Mapped ${header.trim()} -> ${mapped}`)
    }
  })

  const rescuedRows: Array<Record<CanonicalField, string>> = []

  const sourceHint = detectSourceHint(file.name, headers)
  if (sourceHint) {
    notes.push(sourceHint)
  }

  for (const record of records) {
    const canonical = buildCanonicalRow(record)

    rebuiltTimestampCount += canonical.rebuiltTimestamp ? 1 : 0
    rebuiltExitTimeCount += canonical.rebuiltExitTime ? 1 : 0
    mirroredExitTimeCount += canonical.mirroredExitTime ? 1 : 0
    numericSanitizedCount += canonical.numericSanitized ? 1 : 0

    if (isLedgerNoise(record, canonical.row)) {
      droppedNoiseCount += 1
      continue
    }

    if (!hasRequiredValues(canonical.row)) {
      droppedIncompleteCount += 1
      continue
    }

    rescuedRows.push(canonical.row)
  }

  if (delimiter !== ',') {
    notes.push(`Normalized ${DELIMITER_LABELS[delimiter]}-delimited export into clean upload CSV.`)
  }

  notes.push(...mappedNotes)

  if (paddedRows > 0) {
    notes.push(`Padded ${paddedRows} short row${paddedRows === 1 ? '' : 's'} to match the header width.`)
  }
  if (trimmedRows > 0) {
    notes.push(`Trimmed ${trimmedRows} overflow row${trimmedRows === 1 ? '' : 's'} back to the core trade columns.`)
  }
  if (rebuiltTimestampCount > 0) {
    notes.push(`Rebuilt timestamp from split date/time columns on ${rebuiltTimestampCount} row${rebuiltTimestampCount === 1 ? '' : 's'}.`)
  }
  if (rebuiltExitTimeCount > 0) {
    notes.push(`Rebuilt exit_time from split close-date fields on ${rebuiltExitTimeCount} row${rebuiltExitTimeCount === 1 ? '' : 's'}.`)
  }
  if (mirroredExitTimeCount > 0) {
    notes.push(`Mirrored timestamp into exit_time on ${mirroredExitTimeCount} row${mirroredExitTimeCount === 1 ? '' : 's'} so single-time exports can clear validation.`)
  }
  if (numericSanitizedCount > 0) {
    notes.push(`Normalized currency-formatted size/PnL fields on ${numericSanitizedCount} row${numericSanitizedCount === 1 ? '' : 's'}.`)
  }
  if (droppedNoiseCount > 0) {
    notes.push(`Dropped ${droppedNoiseCount} ledger or charge row${droppedNoiseCount === 1 ? '' : 's'} that were not closed trades.`)
  }
  if (droppedIncompleteCount > 0) {
    notes.push(`Dropped ${droppedIncompleteCount} incomplete row${droppedIncompleteCount === 1 ? '' : 's'} that still lacked required trade fields.`)
  }
  if (records.length > 0 && rescuedRows.length === 0) {
    notes.push('No rows survived rescue. Use the template or paste the smallest clean recent trade block manually.')
  }

  const nextText = buildOutputText(rescuedRows)
  const normalizedOriginal = originalText.replace(/\r\n/g, '\n').trim()
  const applied = nextText.trim() !== normalizedOriginal
  const rescuedFile = applied
    ? new File([nextText], file.name, { type: file.type || 'text/csv' })
    : file

  return {
    file: rescuedFile,
    applied,
    notes,
  }
}
