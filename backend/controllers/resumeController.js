import Resume from '../models/Resume.js'
import { scoreResume } from '../services/resumeService.js'

export async function uploadResume(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume PDF uploaded' })
    }

    const resume = await Resume.create({
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer,
      jd: req.body.jd || '',
    })

    const scored = await scoreResume(resume)
    res.status(201).json(scored)
  } catch (err) {
    next(err)
  }
}

export async function listResumes(req, res, next) {
  try {
    // `-data` excludes the PDF bytes; `-createdAt` = newest first.
    const resumes = await Resume.find().sort('-createdAt').select('-data')
    res.json(resumes)
  } catch (err) {
    next(err)
  }
}
