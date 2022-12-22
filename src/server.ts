import logger from './logger'

logger.info('Starting streaming backend')

import * as dotenv from 'dotenv'
dotenv.config()
import http from 'http'
import express, { Request, Response } from 'express'
import { Server, Socket } from 'socket.io'
const app = express()
const server = http.createServer(app)
const io = new Server(server)
import bodyParser from 'body-parser'
import songsRouter from './routes/songs.route'
import { bucket } from './database'
import helmet from 'helmet'

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
app.use(bodyParser.json({ limit: '50mb' }))

app.use(helmet())
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Cross-Origin-Resource-Policy', 'cross-origin')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE')
  res.header(
    'Access-Control-Allow-Headers',
    'X-Requested-With, X-HTTP-Method-Override, Key, Content-Type, Accept, authorization'
  )
  if ('OPTIONS' == req.method) {
    res.sendStatus(200)
  } else {
    next()
  }
})
app.use('/songs', songsRouter)
app.get('/ping', (req: Request, res: Response) => {
  res.status(200).send('pong')
})

io.on('connect', (socket: Socket) => {
  logger.info('Client connected to socket')

  socket.on('disconnect', () => {
    logger.info('Client disconnected from socket')
  })

  socket.on('play', (data) => {
    const { id, start, end } = data
    bucket.openDownloadStreamByName(id, { start, end }).on('data', (chunk) => {
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
