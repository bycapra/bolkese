export const CATEGORY_ORDER = ['MADEN', 'GRAM ALTIN', 'SARRAFIYE', 'DOVIZ', 'PARITE']

export const CATEGORY_TITLES = {
  MADEN: 'Maden',
  'GRAM ALTIN': 'Gram Altın',
  SARRAFIYE: 'Sarrafiye',
  DOVIZ: 'Döviz',
  PARITE: 'Parite',
}

const SYMBOL_LABELS = {
  ALTIN: 'Altın (TL/gram)',
  XAUUSD: 'Altın (USD/ons)',
  XAUUSDS: 'Altın (USD/ons, spot)',
  XAUEUR: 'Altın (EUR/ons)',
  XAUXAG: 'Altın / Gümüş Oranı',
  GUMTRY: 'Gümüş (TL/gram)',
  GUMUSD: 'Gümüş (USD/ons)',
  XAGUSD: 'Gümüş (USD/ons)',
  KXAGUSD: 'Gümüş (USD/kg)',
  PLATIN: 'Platin (TL)',
  XPTUSD: 'Platin (USD/ons)',
  PALADYUM: 'Paladyum (TL)',
  XPDUSD: 'Paladyum (USD/ons)',
  PARUSD: 'Altın parite (USD)',
  PAREUR: 'Altın parite (EUR)',
  PARGBP: 'Altın parite (GBP)',
  PARCHF: 'Altın parite (CHF)',
  FARK: 'Altın fark değeri',
  'VADE FARK': 'Vadeli altın fark değeri',
  '5 GR GRAM ALTIN': '5 gram altın',
  '10 GR GRAM ALTIN': '10 gram altın',
  '20 GR GRAM ALTIN': '20 gram altın',
  '50 GR GRAM ALTIN': '50 gram altın',
  '100 GR GRAM ALTIN': '100 gram altın',
  CEYREK_YENI: 'Çeyrek Altın (Yeni Cumhuriyet)',
  CEYREK_ESKI: 'Çeyrek Altın (Eski Cumhuriyet)',
  YARIM_YENI: 'Yarım Altın (Yeni Cumhuriyet)',
  YARIM_ESKI: 'Yarım Altın (Eski Cumhuriyet)',
  TEK_YENI: 'Tam Altın (Yeni Cumhuriyet)',
  TEK_ESKI: 'Tam Altın (Eski Cumhuriyet)',
  ATA_YENI: 'Ata Altın (Yeni)',
  ATA_ESKI: 'Ata Altın (Eski)',
  ATA5_YENI: '5’li Ata Altın (Yeni)',
  ATA5_ESKI: '5’li Ata Altın (Eski)',
  GREMESE_YENI: 'Gremese Altın (Yeni)',
  GREMESE_ESKI: 'Gremese Altın (Eski)',
  AYAR22: '22 Ayar Bilezik Altın',
  AYAR14: '14 Ayar Altın',
  KULCEALTIN: 'Külçe Altın',
  USDTRY: 'Amerikan Doları / Türk Lirası',
  EURTRY: 'Euro / Türk Lirası',
  GBPTRY: 'İngiliz Sterlini / Türk Lirası',
  CHFTRY: 'İsviçre Frangı / Türk Lirası',
  AUDTRY: 'Avustralya Doları / Türk Lirası',
  CADTRY: 'Kanada Doları / Türk Lirası',
  JPYTRY: 'Japon Yeni / Türk Lirası',
  SARTRY: 'Suudi Riyali / Türk Lirası',
  DKKTRY: 'Danimarka Kronu / Türk Lirası',
  NOKTRY: 'Norveç Kronu / Türk Lirası',
  SEKTRY: 'İsveç Kronu / Türk Lirası',
  EURGBP: 'Euro / İngiliz Sterlini',
  EURCHF: 'Euro / İsviçre Frangı',
  EURUSDS: 'Euro / ABD Doları (spot)',
  XUSDTRY: 'USD/TRY (çapraz kur)',
  FARKEUR: 'EUR bazlı fark değeri',
  EURUSD: 'Euro / ABD Doları',
  GBPUSD: 'İngiliz Sterlini / ABD Doları',
  AUDUSD: 'Avustralya Doları / ABD Doları',
  USDCHF: 'ABD Doları / İsviçre Frangı',
  USDCAD: 'ABD Doları / Kanada Doları',
  USDJPY: 'ABD Doları / Japon Yeni',
  USDSAR: 'ABD Doları / Suudi Riyali',
  USDDKK: 'ABD Doları / Danimarka Kronu',
  USDNOK: 'ABD Doları / Norveç Kronu',
  USDSEK: 'ABD Doları / İsveç Kronu',
  USDRUB: 'ABD Doları / Rus Rublesi',
}

export function labelFor(quote) {
  if (quote?.description) return quote.description
  return SYMBOL_LABELS[quote?.symbol] || quote?.symbol || ''
}

export function categoryTitle(category) {
  return CATEGORY_TITLES[category] || category || 'Diğer'
}

export function groupQuotes(quotes) {
  const groups = new Map()
  for (const quote of quotes.values()) {
    const key = quote.category || 'Diğer'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(quote)
  }

  for (const rows of groups.values()) {
    rows.sort((a, b) => labelFor(a).localeCompare(labelFor(b), 'tr'))
  }

  const ordered = []
  for (const key of CATEGORY_ORDER) {
    if (groups.has(key)) ordered.push({ category: key, title: categoryTitle(key), rows: groups.get(key) })
  }
  for (const [key, rows] of groups) {
    if (!CATEGORY_ORDER.includes(key)) {
      ordered.push({ category: key, title: categoryTitle(key), rows })
    }
  }
  return ordered
}
