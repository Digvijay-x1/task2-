import express from "express";
import { createUser , getUser } from "../controllers/user.controllers.js";

const router = express.Router();

router.post("/register", createUser ) ; 
router.get("/me" , getUser ) ; 

export default router;
