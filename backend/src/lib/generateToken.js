import jwt from "jsonwebtoken" ; 
import ENV from "../config/env.config.js" 

export const generateToken = (userId , res)=>{
    const token = jwt.sign({userId} , ENV.JWT , {expiresIn: "1d"}); 
    res.cookie("jwt", token, {
        httpOnly: true, // so that the token is not accessible to the client . prevent XSS attacks and cross site scripting attacks
        secure: process.env.NODE_ENV !== "development", // in production we will use https
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // Use 'none' in production with secure flag to allow cross-site cookies
        path: "/", // Ensure cookie is available across all paths
    });

    return token;
}  