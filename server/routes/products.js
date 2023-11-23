import express from "express";
import productController from "../controllers/productController.js";

const router = express.Router();

//obtener las pizzas
router.get("/", productController.readAll);
//crear una pizza
router.post("/create", productController.create);
//obtener una pizza
router.get("/readone/:id", productController.readOne);
//actualizar una pizza
router.put("/updateone/:id", productController.edit);
// borrar una pizza
router.delete("/deleteone/:id", productController.deleteOne);

export default router;
