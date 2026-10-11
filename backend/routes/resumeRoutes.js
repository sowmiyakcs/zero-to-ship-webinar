import { Router } from 'express'
import upload from '../middleware/upload.js'
import { uploadResume, listResumes } from '../controllers/resumeController.js'

const router = Router()

router.post('/', upload.single('resume'), uploadResume)
router.get('/', listResumes)

export default router
