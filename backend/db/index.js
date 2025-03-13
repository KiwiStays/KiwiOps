import mongoose from 'mongoose';

const connectDB = async(url)=>{
    try {
        const connectionInstance = await mongoose.connect(url, {
          serverSelectionTimeoutMS: 30000, // Set a timeout for server selection
        });
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
      } catch (err) {
        console.error('Error connecting to MongoDB:', err.message || err);
        setTimeout(() => {
          console.log('Retrying to connect...');
          connectDB(url); // Retry connection
        }, 5000); // Retry after 5 seconds
      }
}

export default connectDB
