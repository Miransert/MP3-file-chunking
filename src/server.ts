import http from 'http'
import express from 'express'
import { Server } from 'socket.io'
import fs from 'fs'
import { GridFSBucket, MongoClient } from 'mongodb'
import Grid from 'gridfs-stream'
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

app.get('/play', (req, res) => {
  bucket.openDownloadStreamByName('all_my_love.mp3').pipe(res)
})

app.listen(802, () => {
  // Song.create({ data: '21312321fsdgdfshgdfs' }).save()
  console.log('Initialized server')
})