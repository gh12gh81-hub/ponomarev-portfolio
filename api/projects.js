// Это функция, которая будет работать на Vercel как полноценный API
import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  // Разрешаем CORS для безопасности (опционально)
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  // Читаем JSON прямо из папки public/data
  const filePath = path.join(process.cwd(), 'public', 'data', 'projects.json')
  try {
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    res.status(200).json(jsonData)
  } catch (error) {
    res.status(500).json({ error: 'Failed to read projects data' })
  }
}
