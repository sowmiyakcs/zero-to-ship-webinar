// Multer request middleware: accepts only PDFs, keeps them in memory
// (buffer lands in req.file.buffer so the controller can store it in MongoDB).
import multer from 'multer'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB cap
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'resume'))
  },
})

export default upload
