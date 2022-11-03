import http from 'http'
import express from 'express'
import { Server, Socket } from 'socket.io'

const app = express()
const server = http.createServer(app)
const io = new Server(server)

io.on('connect', (socket) => {
  console.log('Client connected')
  socket.on('disconnect', () => {
    console.log('Client disconnected')
  })

  socket.on('ping', () => {
    socket.emit('pong')
  })
})

server.listen(802, () => {
  console.log('Initialized server')
})
