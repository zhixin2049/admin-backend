import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import * as trpcExpress from '@trpc/server/adapters/express'
import { appRouter } from './routers'
import { createContext } from './context'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

app.use('/api/trpc', trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext,
}))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
