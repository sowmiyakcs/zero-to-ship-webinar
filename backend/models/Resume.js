import mongoose from 'mongoose'

const resumeSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  data: { type: Buffer, required: true, select: false },
  jd: { type: String, default: '' },
  score: { type: Number },
  skillsFound: [String],
  skillsMissing: [String],
}, { timestamps: true })

export default mongoose.model('Resume', resumeSchema)
