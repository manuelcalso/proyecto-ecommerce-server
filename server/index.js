//importaciones
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

//archivos
import userRoute from "./../server/routes/users.js";
import productRoute from "./../server/routes/products.js";
import checkoutRoute from "./../server/routes/checkout.js";
import connectDB from "./config/db.js";

//inicializadores
const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

connectDB();

const port = process.env.BASE_URL_PORT || 3005;

//rutas
app.use("/api/v1/users", userRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/checkout", checkoutRoute);

//listeners
app.listen(port, () => {
  return console.log("servidor encendido");
});
