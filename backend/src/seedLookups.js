const UNITS = [
  { value: 'adet', label: 'Adet' },
  { value: 'kilo', label: 'Kilo' },
  { value: 'gram', label: 'Gram' },
]

const SYMBOLS = [
  ['ALTIN', 'Altın (TL/gram)', 'MADEN'],
  ['XAUUSD', 'Altın (USD/ons)', 'MADEN'],
  ['XAUUSDS', 'Altın (USD/ons, spot)', 'MADEN'],
  ['XAUEUR', 'Altın (EUR/ons)', 'MADEN'],
  ['XAUXAG', 'Altın / Gümüş Oranı', 'MADEN'],
  ['GUMTRY', 'Gümüş (TL/gram)', 'MADEN'],
  ['GUMUSD', 'Gümüş (USD/ons)', 'MADEN'],
  ['XAGUSD', 'Gümüş (USD/ons)', 'MADEN'],
  ['KXAGUSD', 'Gümüş (USD/kg)', 'MADEN'],
  ['PLATIN', 'Platin (TL)', 'MADEN'],
  ['XPTUSD', 'Platin (USD/ons)', 'MADEN'],
  ['PALADYUM', 'Paladyum (TL)', 'MADEN'],
  ['XPDUSD', 'Paladyum (USD/ons)', 'MADEN'],
  ['PARUSD', 'Altın parite (USD)', 'MADEN'],
  ['PAREUR', 'Altın parite (EUR)', 'MADEN'],
  ['PARGBP', 'Altın parite (GBP)', 'MADEN'],
  ['PARCHF', 'Altın parite (CHF)', 'MADEN'],
  ['FARK', 'Altın fark değeri', 'MADEN'],
  ['VADE FARK', 'Vadeli altın fark değeri', 'MADEN'],
  ['5 GR GRAM ALTIN', '5 gram altın', 'GRAM ALTIN'],
  ['10 GR GRAM ALTIN', '10 gram altın', 'GRAM ALTIN'],
  ['20 GR GRAM ALTIN', '20 gram altın', 'GRAM ALTIN'],
  ['50 GR GRAM ALTIN', '50 gram altın', 'GRAM ALTIN'],
  ['100 GR GRAM ALTIN', '100 gram altın', 'GRAM ALTIN'],
  ['CEYREK_YENI', 'Çeyrek Altın (Yeni Cumhuriyet)', 'SARRAFIYE'],
  ['CEYREK_ESKI', 'Çeyrek Altın (Eski Cumhuriyet)', 'SARRAFIYE'],
  ['YARIM_YENI', 'Yarım Altın (Yeni Cumhuriyet)', 'SARRAFIYE'],
  ['YARIM_ESKI', 'Yarım Altın (Eski Cumhuriyet)', 'SARRAFIYE'],
  ['TEK_YENI', 'Tam Altın (Yeni Cumhuriyet)', 'SARRAFIYE'],
  ['TEK_ESKI', 'Tam Altın (Eski Cumhuriyet)', 'SARRAFIYE'],
  ['ATA_YENI', 'Ata Altın (Yeni)', 'SARRAFIYE'],
  ['ATA_ESKI', 'Ata Altın (Eski)', 'SARRAFIYE'],
  ['ATA5_YENI', '5\'li Ata Altın (Yeni)', 'SARRAFIYE'],
  ['ATA5_ESKI', '5\'li Ata Altın (Eski)', 'SARRAFIYE'],
  ['GREMESE_YENI', 'Gremese Altın (Yeni)', 'SARRAFIYE'],
  ['GREMESE_ESKI', 'Gremese Altın (Eski)', 'SARRAFIYE'],
  ['AYAR22', '22 Ayar Bilezik Altın', 'SARRAFIYE'],
  ['AYAR14', '14 Ayar Altın', 'SARRAFIYE'],
  ['KULCEALTIN', 'Külçe Altın', 'SARRAFIYE'],
  ['USDTRY', 'Amerikan Doları / Türk Lirası', 'DOVIZ'],
  ['EURTRY', 'Euro / Türk Lirası', 'DOVIZ'],
  ['GBPTRY', 'İngiliz Sterlini / Türk Lirası', 'DOVIZ'],
  ['CHFTRY', 'İsviçre Frangı / Türk Lirası', 'DOVIZ'],
  ['AUDTRY', 'Avustralya Doları / Türk Lirası', 'DOVIZ'],
  ['CADTRY', 'Kanada Doları / Türk Lirası', 'DOVIZ'],
  ['JPYTRY', 'Japon Yeni / Türk Lirası', 'DOVIZ'],
  ['SARTRY', 'Suudi Riyali / Türk Lirası', 'DOVIZ'],
  ['DKKTRY', 'Danimarka Kronu / Türk Lirası', 'DOVIZ'],
  ['NOKTRY', 'Norveç Kronu / Türk Lirası', 'DOVIZ'],
  ['SEKTRY', 'İsveç Kronu / Türk Lirası', 'DOVIZ'],
  ['EURGBP', 'Euro / İngiliz Sterlini', 'DOVIZ'],
  ['EURCHF', 'Euro / İsviçre Frangı', 'DOVIZ'],
  ['EURUSDS', 'Euro / ABD Doları (spot)', 'DOVIZ'],
  ['XUSDTRY', 'USD/TRY (çapraz kur)', 'DOVIZ'],
  ['FARKEUR', 'EUR bazlı fark değeri', 'DOVIZ'],
  ['EURUSD', 'Euro / ABD Doları', 'PARITE'],
  ['GBPUSD', 'İngiliz Sterlini / ABD Doları', 'PARITE'],
  ['AUDUSD', 'Avustralya Doları / ABD Doları', 'PARITE'],
  ['USDCHF', 'ABD Doları / İsviçre Frangı', 'PARITE'],
  ['USDCAD', 'ABD Doları / Kanada Doları', 'PARITE'],
  ['USDJPY', 'ABD Doları / Japon Yeni', 'PARITE'],
  ['USDSAR', 'ABD Doları / Suudi Riyali', 'PARITE'],
  ['USDDKK', 'ABD Doları / Danimarka Kronu', 'PARITE'],
  ['USDNOK', 'ABD Doları / Norveç Kronu', 'PARITE'],
  ['USDSEK', 'ABD Doları / İsveç Kronu', 'PARITE'],
  ['USDRUB', 'ABD Doları / Rus Rublesi', 'PARITE'],
  ['TRY', 'Türk Lirası', 'NAKIT'],
]

export function seedLookups(db) {
  const insertUnit = db.prepare('INSERT OR REPLACE INTO units (value, label) VALUES (?, ?)')
  const insertSymbol = db.prepare(
    'INSERT OR REPLACE INTO symbols (code, description, category) VALUES (?, ?, ?)',
  )

  const run = db.transaction(() => {
    for (const unit of UNITS) insertUnit.run(unit.value, unit.label)
    for (const [code, description, category] of SYMBOLS) {
      insertSymbol.run(code, description, category)
    }
  })
  run()
}
