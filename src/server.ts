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
import { body, param, validationResult } from 'express-validator'

// Creates chunking bucket and establishes connection to the mongo database
let bucket: GridFSBucket

const mongoURI = String(process.env.DB_URL)
console.log(mongoURI)
const client = new MongoClient(mongoURI)
client
  .connect()
  .then((co) => {
    console.log('Successfully connected to MongoDB')
    const db = co.db('songs')
    bucket = new GridFSBucket(db, { bucketName: 'songs' })
    // Immediately uploads the song all_my_love.mp3 to the database with the name all_my_love.mp3 with chunks of 10000 bits.
    // Could be less or more depending on need
    // Maybe set name to be equal to id?
  })
  .catch((err) => {
    console.error(err)
  })

// Socket.IO streaming implementation
// Client connected to socket server
io.on('connect', (socket: Socket) => {
  console.log('Client connected to socket')

  // Client disconnected from socket server
  socket.on('disconnect', () => {
    console.log('Client disconnected from socket')
  })

  // Client sent event with type play and thus, we begin streaming song from database and "emitting" or sending it in chunks of data.
  // Song can be found by specific name or id
  socket.on('play', () => {
    bucket.openDownloadStreamByName('all_my_love.mp3').on('data', (chunk) => {
      console.log(chunk)
      socket.emit('audio-chunk', chunk)
    })
  })
})

// HTTP streaming implementation. Same principle, except using the pipe function.
app.get(
  '/songs/:songId',
  param('songId')
    .exists()
    .withMessage('An explicit song identifier is required'),
  validate,
  async (req: express.Request, res: express.Response) => {
    bucket
      .openDownloadStreamByName(req.params.songId)
      .on('error', () => {
        res.sendStatus(400)
      })
      .pipe(res)
  }
)

// Maybe we should just make an endpoint here that mediq acquisition calls
app.post(
  '/songs',
  body('id').exists().withMessage('An explicit song identifier is required'),
  validate,
  upload.single('file'),
  (req, res) => {
    if (!req.file) return
    fs.createReadStream(req.file.path).pipe(
      bucket.openUploadStream(req.body.id).on('finish', () => {
        res.sendStatus(202)
      })
    )
  }
)

// Validation middleware. Should come after validation definition
function validate(req: express.Request, res: express.Response) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) res.status(400).json({ errors: errors.array })
}

// Opens the socket server and HTTP server for requests
server.listen(802, () => {
  console.log('Initialized server')
})
