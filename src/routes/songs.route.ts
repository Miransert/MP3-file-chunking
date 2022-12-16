import express from 'express'
import * as songsController from '../controllers/songs.controller'
import multer from 'multer'
import validateUser from '../middleware/validationMiddleware'
const upload = multer({ dest: 'test/' })

const router = express.Router()

router.get('/:songId', validateUser, songsController.getSongByID)

router.post(
  '/',
  validateUser,
  upload.single('file'),
  songsController.createSong
)

export default router
