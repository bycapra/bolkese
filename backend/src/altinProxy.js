const ALTIN_ORIGIN = 'https://altinapi.com/api/v1'

export default async function altinProxy(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Yalnızca GET desteklenir.' })
    return
  }

  const apiKey = String(process.env.ALTINAPI_KEY || '').trim()
  if (!apiKey) {
    res.status(401).json({ error: 'API anahtarı eksik veya geçersiz.' })
    return
  }

  const suffix = req.url === '/' ? '' : req.url
  const target = `${ALTIN_ORIGIN}${suffix}`

  try {
    const upstream = await fetch(target, {
      headers: {
        Accept: 'application/json',
        'X-API-Key': apiKey,
      },
    })
    const body = await upstream.text()
    const contentType = upstream.headers.get('content-type') || 'application/json; charset=utf-8'
    res.status(upstream.status)
    res.setHeader('Content-Type', contentType)
    res.send(body)
  } catch {
    res.status(503).json({ error: 'Kaynak bağlantısı kesildi. Veri gecikmeli olabilir.' })
  }
}
