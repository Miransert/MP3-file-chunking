import { Request, Response } from 'express'
import { bucket } from '../database'
import fs from 'fs'

export function getSongByID(req: Request, res: Response) {
  res.set('Content-Type', 'audio/mpeg')
  //   res.set(
  //     'Content-Disposition',
  //     'attachment; filename="' + req.file.filename + '"'
  //   )
  bucket
    .openDownloadStreamByName(req.params.songId)
    .on('error', () => {
      res.sendStatus(400)
    })
    .pipe(res)
}

export function createSong(req: Request, res: Response) {
  console.log(req.file)
  if (!req.file) return

  fs.createReadStream(req.file.path).pipe(
    bucket.openUploadStream(req.body.id).on('finish', () => {
      res.sendStatus(202)
    })
  )
}
