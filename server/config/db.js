import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.BASE_URL_DB_PRODUCTION, {});

    console.log("Base de datos conectada.");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectDB;
