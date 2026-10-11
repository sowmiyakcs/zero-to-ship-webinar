import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import resumeRoutes from './routes/resumeRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/resumes', resumeRoutes)

app.use(errorHandler)

// Connect to MongoDB first, then start listening.
const start = async () => {
  await connectDB()
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
}

start()
