import { Request, Response } from 'express'
import { bucket } from '../database'
import fs from 'fs'


export function getSongByID(req: Request, res: Response) {
    bucket
        .openDownloadStreamByName(req.params.songId)
        .on('error', () => {
            res.sendStatus(400)
        })
        .pipe(res)
}

export function createSong(req: Request, res: Response) {
    if (!req.file) return
    fs.createReadStream(req.file.path).pipe(
        bucket.openUploadStream(req.body.id).on('finish', () => {
            return res.sendStatus(202)
        })
    )
    return res.sendStatus(500)
}

