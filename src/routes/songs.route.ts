import express from 'express'
import * as songsController from '../controllers/songs.controller'
import multer from 'multer'
const upload = multer({ dest: 'test/' })


const router = express.Router()

router.get('/:songID', songsController.getSongByID)

router.post('/', upload.single('file'), songsController.createSong)

export default router

