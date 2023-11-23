//importciones
import express from "express";
import usersController from "../controllers/usersController.js";
import jwt from "jsonwebtoken";

///inicializadores
const router = express.Router();

//controladores
//leer usuarios
router.get("/", usersController.readAll);
//crear usuarios
router.post("/create", usersController.create);
//login de usuarios
router.post("/login", usersController.login);
//autorizacion de usuario
//integracion de middlewares
router.get(
  "/verifytoken",
  async (req, res, next) => {
    //desencriptar datos
    const token = req.header("x-auth-token");

    if (!token) {
      return res.status(401).json({
        msg: "No hay token o es invalido",
      });
    }

    try {
      //token desencriptado
      const openToken = jwt.verify(token, process.env.JWT_SECRET);
      //pasarlo en el req
      req.user = openToken.user;

      next();
    } catch (error) {
      res.status(500).json({
        msg: "hubo un erro en servidor o token",
      });
    }
  },
  usersController.verifyToken
);

export default router;
