import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../../node_modules/cloudinary/lib/cloudinary'

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({ folder: 'eduction/course-videos', resource_type: 'video', allowed_formats: ['mp4','mov','mkv','webm'] }),
})

export default multer({ storage, limits: { fileSize: 1024 * 1024 * 500 } })
