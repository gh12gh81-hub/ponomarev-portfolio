import fs from 'node:fs/promises'
import path from 'node:path'
import { readProjectsForAdmin } from '../server/projectStore.js'

const bundledProjectsPath = path.join(process.cwd(), 'public', 'data', 'projects.json')

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Allow', 'GET')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { projects, source } = await readProjectsForAdmin()
    res.setHeader(
      'Cache-Control',
      source === 'github'
        ? 'public, s-maxage=30, stale-while-revalidate=300'
        : 'public, s-maxage=300, stale-while-revalidate=86400',
    )
    return res.status(200).json(projects)
  } catch (error) {
    // Keep the public site available if GitHub has a temporary outage.
    try {
      const bundledProjects = JSON.parse(await fs.readFile(bundledProjectsPath, 'utf8'))
      res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300')
      return res.status(200).json(bundledProjects)
    } catch {
      console.error('Failed to read projects data', error)
      return res.status(500).json({ error: 'Failed to read projects data' })
    }
  }
}
