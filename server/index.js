//importaciones
import express from "express";
import cors from "cors";

//inicializadores
const app = express();
const data = ["hola", "mundo"];

//rutas
app.get("/", (req, res) => {
  res.json({
    msg: "este es un mensaje",
    data: data,
  });
});

//listeners
app.listen(3005, () => {
  return console.log("servidor encendido");
});
