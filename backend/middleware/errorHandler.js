// Central error-handling middleware. Controllers defer errors here with
// next(err); multer rejections and server faults land in this one place.
import { MulterError } from 'multer'

export function errorHandler(err, req, res, next) {
  console.error(err)

  if (err instanceof MulterError) {
    return res.status(400).json({ error: err.message })
  }

  res.status(err.status || 500).json({ error: err.message || 'Server error' })
}
