import mongoose, { connect } from 'mongoose'

// Connects to database and exports the database model
export const connectDB = async () => {
  mongoose.connect('mongodb://localhost:27017').catch((err) => {
    console.error(err)
  })
}
