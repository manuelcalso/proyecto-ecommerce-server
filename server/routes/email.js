import express from "express";
import emailController from "../controllers/emailController.js";
const router = express.Router();

router.post(
  "/send-email",
  express.raw({ type: "application/json" }),
  emailController.sendEmail
);

export default router;
