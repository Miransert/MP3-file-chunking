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

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/songs', songsRouter)

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

// Opens the socket server and HTTP server for requests
server.listen(802, () => {
  console.log('Initialized server')
})
