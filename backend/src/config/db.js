import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.warn("MONGO_URI is not set. API will start, but database routes need MongoDB.");
      return;
    }

    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
  }
};

export default connectDB;

