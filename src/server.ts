import logger from './logger'

logger.info('Starting streaming backend')

import * as dotenv from 'dotenv'
dotenv.config()
import http from 'http'
import express from 'express'
import { Server, Socket } from 'socket.io'
import fs from 'fs'
import { GridFSBucket, MongoClient } from 'mongodb'
const app = express()
const server = http.createServer(app)
const io = new Server(server)
import multer from 'multer'
const upload = multer({ dest: 'test/' })
import { body, validationResult } from 'express-validator'
import bodyParser from 'body-parser'

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Creates chunking bucket and establishes connection to the mongo database
let bucket: GridFSBucket

const mongoURI = String(process.env.DB_URL)
const client = new MongoClient(mongoURI)
client
  .connect()
  .then((co) => {
    logger.info('Successfully connected to MongoDB')
    const db = co.db('songs')
    bucket = new GridFSBucket(db, { bucketName: 'songs' })
    // Immediately uploads the song all_my_love.mp3 to the database with the name all_my_love.mp3 with chunks of 10000 bits.
    // Could be less or more depending on need
    // Maybe set name to be equal to id?
  })
  .catch((err) => {
    logger.error(err.toString())
  })

// Socket.IO streaming implementation
// Client connected to socket server
io.on('connect', (socket: Socket) => {
  logger.info('Client connected to socket')

  // Client disconnected from socket server
  socket.on('disconnect', () => {
    logger.info('Client disconnected from socket')
  })

  // Client sent event with type play and thus, we begin streaming song from database and "emitting" or sending it in chunks of data.
  // Song can be found by specific name or id
  socket.on('play', () => {
    bucket.openDownloadStreamByName('all_my_love.mp3').on('data', (chunk) => {
      logger.info(chunk)
      socket.emit('audio-chunk', chunk)
    })
  })
})

// HTTP streaming implementation. Same principle, except using the pipe function.
app.get(
  '/songs/:songId',
  // param('songId')
  //   .exists()
  //   .withMessage('An explicit song identifier is required'),
  // validate,
  async (req: express.Request, res: express.Response) => {
    bucket
      .openDownloadStreamByName(req.params.songId)
      .on('error', () => {
        res.sendStatus(400)
      })
      .pipe(res)
  }
)

// Maybe we should just make an endpoint here that media acquisition calls
app.post(
  '/songs',
  body('id').exists().withMessage('An explicit song identifier is required'),
  // validate,
  upload.single('file'),
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() })
    console.log(req.body)
    if (!req.file) return
    fs.createReadStream(req.file.path).pipe(
      bucket.openUploadStream(req.body.id).on('finish', () => {
        return res.sendStatus(202)
      })
    )
    return res.sendStatus(500)
  }
)

// Validation middleware. Should come after validation definition
// function validate(req: express.Request, res: express.Response, next: NextFunction) {
//   console.log(req)

//   next()

// }

// Opens the socket server and HTTP server for requests
server.listen(802, () => {
  logger.info('Initialized server')
  logger.silly(
    'Keep in mind that the above message \ndosent mean that the database connection has been established'
  )
})
