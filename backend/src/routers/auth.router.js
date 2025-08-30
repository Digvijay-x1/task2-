import express from "express";
import { register, login, me , logout , updateProfile } from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/register", register);
router.get("/login", login);
router.get("/user", me);
router.get("/logout", logout); 
router.post("/update" , updateProfile ) ; 

export default router;
