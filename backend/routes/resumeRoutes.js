import { Router } from 'express'
import multer from 'multer'
import { uploadResume, listResumes } from '../controllers/resumeController.js'

const router = Router()

// Memory storage: buffer lands in req.file.buffer for MongoDB.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB cap
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'resume'))
  },
})

router.post('/', upload.single('resume'), uploadResume)
router.get('/', listResumes)

export default router
