//importciones
import express from "express";
import usersController from "../controllers/usersController.js";
import authorization from "./../middleware/authorization.js";

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
router.get("/verifytoken", authorization, usersController.verifyToken);
//cambio de contraseña
router.post("/changepassword", usersController.changePassword);

export default router;
