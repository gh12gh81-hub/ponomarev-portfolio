import { createServer, loadEnv } from 'vite'
import sessionHandler from '../api/admin/session.js'
import projectsHandler from '../api/admin/projects.js'
import cloudinarySignatureHandler from '../api/admin/cloudinary-signature.js'

Object.assign(process.env, loadEnv('development', process.cwd(), ''))
process.env.ADMIN_STORAGE ||= 'local'

const routes = new Map([
  ['/api/admin/session', sessionHandler],
  ['/api/admin/projects', projectsHandler],
  ['/api/admin/cloudinary-signature', cloudinarySignatureHandler],
])

const server = await createServer({
  server: { host: '127.0.0.1' },
  plugins: [{
    name: 'portfolio-admin-api',
    configureServer(viteServer) {
      viteServer.middlewares.use(async (req, res, next) => {
        const pathname = new URL(req.url || '/', 'http://localhost').pathname
        const handler = routes.get(pathname)
        if (!handler) return next()

        try {
          await handler(req, res)
        } catch (error) {
          if (res.headersSent) return res.end()
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Local API error.' }))
        }
      })
    },
  }],
})

await server.listen()
server.printUrls()
