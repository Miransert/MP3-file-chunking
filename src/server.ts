import logger from './logger'

logger.info('Starting streaming backend')

import * as dotenv from 'dotenv'
dotenv.config()
import http from 'http'
import express from 'express'
import { Server, Socket } from 'socket.io'
const app = express()
const server = http.createServer(app)
const io = new Server(server)
import bodyParser from 'body-parser'
import songsRouter from './routes/songs.route'
import { bucket } from './database'
import helmet from 'helmet'
import cors from 'cors'

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(helmet())
app.use(cors({ origin: '*' }))
app.use('/songs', songsRouter)

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
  socket.on('play', (data) => {
    bucket.openDownloadStreamByName(data.id).on('data', (chunk) => {
      logger.info(chunk)
      socket.emit('audio-chunk', chunk)
    })
  })
})

// Opens the socket server and HTTP server for requests
server.listen(802, () => {
  logger.info('Initialized server')
  logger.silly(
    'Keep in mind that the above message \ndosent mean that the database connection has been established'
  )
})
