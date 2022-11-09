import http from 'http'
import express from 'express'
import { Server, Socket } from 'socket.io'
import fs from 'fs'
import { GridFSBucket, MongoClient } from 'mongodb'
const app = express()
const server = http.createServer(app)
const io = new Server(server)

let bucket: GridFSBucket

const mongoURI = 'mongodb://localhost:27017'
const client = new MongoClient(mongoURI)
client.connect().then((co) => {
  const db = co.db('songs')
  bucket = new GridFSBucket(db)

  fs.createReadStream('./html/Music/all_my_love.mp3').pipe(bucket.openUploadStream('all_my_love.mp3', {
    chunkSizeBytes: 10000,
  }))
}).catch((err) => {
  console.error(err)
})

io.on('connect', (socket: Socket) => {
  console.log('Client connected to socket')
  socket.on('disconnect', () => {
    console.log('Client disconnected from socket')
  })
  socket.on('play', () => {
    bucket.openDownloadStreamByName('all_my_love.mp3')
      .on('data', (chunk) => {
        console.log(chunk)
        socket.emit('audio-chunk', chunk)
      })
  })
})

app.get('/play', (req, res) => {
  bucket.openDownloadStreamByName('all_my_love.mp3').pipe(res)
})

server.listen(802, () => {
  // Song.create({ data: '21312321fsdgdfshgdfs' }).save()
  console.log('Initialized server')
})