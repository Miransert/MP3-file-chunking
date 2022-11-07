import mongoose, { connect } from 'mongoose'

export const connectDB = async () => {
  mongoose.connect('mongodb://localhost:27017').catch((err) => {
    console.error(err)
  })
}
