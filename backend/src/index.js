import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.js'
import assetRoutes from './routes/assets.js'

const app = express()
const port = Number(process.env.PORT) || 4000

app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRoutes)
app.use('/api/assets', assetRoutes)

app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && error.status === 400) {
    res.status(400).json({ error: 'Geçersiz istek gövdesi.' })
    return
  }
  console.error(error)
  res.status(500).json({ error: 'Beklenmeyen bir sunucu hatası oluştu.' })
})

app.listen(port, () => {
  console.log(`BolKese API http://localhost:${port}`)
})
