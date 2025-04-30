import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log('MONGOdB CONNECTED ' + conn.connection.host)
    } catch (e) {
        console.log("MONGOdB NOT CONNECTED: " + e)
    }
}