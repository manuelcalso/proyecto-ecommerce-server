import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

//LOCAL = mongodb://localhost:27017/ecommerce
//PRODUCCION = mongodb+srv://juancallerossol:<password>@pizzeriadb.uqyyig4.mongodb.net/ecommerce
//console.log("URI de la base de datos:", process.env.BASE_URL_DB_PRODUCTION);
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.BASE_URL_DB_LOCAL, {});

    console.log("Base de datos conectada.");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectDB;
