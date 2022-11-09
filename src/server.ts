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


// Creates chunking bucket and establishes connection to the mongo database
let bucket: GridFSBucket

const mongoURI = process.env.DB_URL
const client = new MongoClient(mongoURI)
client.connect().then((co) => {
  const db = co.db('songs')
  bucket = new GridFSBucket(db)

  // Immediately uploads the song all_my_love.mp3 to the database with the name all_my_love.mp3 with chunks of 10000 bits. 
  // Could be less or more depending on need
  // Maybe set name to be equal to id?
  fs.createReadStream('./html/Music/all_my_love.mp3').pipe(bucket.openUploadStream('all_my_love.mp3', {
    chunkSizeBytes: 10000,
  }))
}).catch((err) => {
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
    bucket.openDownloadStreamByName('all_my_love.mp3')
      .on('data', (chunk) => {
        console.log(chunk)
        socket.emit('audio-chunk', chunk)
      })
  })
})

// HTTP streaming implementation. Sasme principle, except using the pipe function.
app.get('/play', (req, res) => {
  bucket.openDownloadStreamByName('all_my_love.mp3').pipe(res)
})

// Maybe we should just make an endpoint here that mediq acquisition calls
app.post('/song', (req, res) => {
  // Need to figure out how to pipe data from req.body into the gridfs bucket
  bucket.openUploadStream(req.body.name, { chunkSizeBytes: 10000 })
})

// Opens the socket server and HTTP server for requests
server.listen(802, () => {
  console.log('Initialized server')
})