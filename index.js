// Matcha Terminal - Production Server
// Serves the built React app. Finnhub API is called directly from the browser
// (no proxy needed - Finnhub allows CORS from real origins, just not sandboxed iframes).

import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const app = express()
const PORT = process.env.PORT || 3000
const __dirname = dirname(fileURLToPath(import.meta.url))

// Serve built frontend
app.use(express.static(join(__dirname, '../dist')))
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'))
})

app.listen(PORT, () => {
  console.log(`\n🍵 Matcha Terminal running at http://localhost:${PORT}`)
})
