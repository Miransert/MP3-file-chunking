import * as dotenv from 'dotenv'
dotenv.config()
import { GridFSBucket, MongoClient } from 'mongodb'

// Creates chunking bucket and establishes connection to the mongo database
export let bucket: GridFSBucket

const mongoURI = String(process.env.DB_URL)
console.log('v2')
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
