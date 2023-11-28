//importaciones
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import swaggerJSDoc from "swagger-jsdoc";

//archivos
import userRoute from "./../server/routes/users.js";
import productRoute from "./../server/routes/products.js";
import checkoutRoute from "./../server/routes/checkout.js";
import connectDB from "./config/db.js";

//inicializadores
const app = express();
app.use(cors());
dotenv.config();

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = process.env.BASE_URL_PORT || 3005;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Documentación sobre usuarios en Ucamp",

      version: "1.0.0",
    },
  },

  apis: [`${path.join(__dirname, "./routes/*.js")}`],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

//A - WEBHOOKS
app.use((req, res, next) => {
  if (req.originalUrl === "/api/v1/checkout/create-order") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

//rutas
app.use("/api/v1/users", userRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/checkout", checkoutRoute);

//listeners
app.listen(port, () => {
  return console.log("servidor encendido");
});
