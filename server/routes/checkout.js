import express from "express";
import checkoutController from "./../controllers/checkoutController.js";

const router = express.Router();

router.get(
  "/create-checkout-session",
  checkoutController.createCheckoutSession
);

router.post(
  "/create-order",
  express.raw({ type: "application/json" }),
  checkoutController.createOrder
);

export default router;
