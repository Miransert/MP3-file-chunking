import { Request, Response } from 'express'
import { bucket } from '../database'
import fs from 'fs'

export async function getSongByID(req: Request, res: Response) {
  const file = (await bucket.find({ filename: req.params.songId }).toArray())[0]
  if (req.headers['range']) {
    const parts = req.headers['range'].replace(/bytes=/, '').split('-')
    const partialstart = parts[0]
    const partialend = parts[1]

    const start = parseInt(partialstart, 10)
    const end = partialend ? parseInt(partialend, 10) : file.length - 1
    const chunksize = end - start + 1

    res.writeHead(206, {
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Range': 'bytes ' + start + '-' + end + '/' + file.length,
      'Content-Type': 'audio/mpeg',
    })
    bucket
      .openDownloadStreamByName(req.params.songId, { start, end })
      .on('error', () => {
        res.sendStatus(400)
      })
      .pipe(res)
  } else {
    res.header('Content-Type', 'audio/mpeg')

    bucket
      .openDownloadStreamByName(req.params.songId)
      .on('error', () => {
        res.sendStatus(400)
      })
      .pipe(res)
  }
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
