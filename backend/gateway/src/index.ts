import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import proxy from "express-http-proxy";
import { isAuth } from "./middlewares/isAuth.js";
import { getCurrentUser } from "./controllers/user.controller.js";
import { proxyWithHeaders } from "./configs/proxyWithHeaders.js";
import { rateLimiter } from "./middlewares/rateLimiter.js";


dotenv.config();


const app = express();


app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials:true
    })
);


app.use(express.json());

app.use(cookieParser());

app.use(morgan("dev"));
app.use(rateLimiter);


app.get("/",(_req,res)=>{

    res.json({
        success:true,
        message:"Sellora API Gateway Running"
    });

});

app.use("/api/auth",proxy(process.env.AUTH_SERVICE_URL as string))
app.use("/api/product",isAuth,proxyWithHeaders(process.env.PRODUCT_SERVICE_URL as string))
app.use("/api/publicProduct",proxy(process.env.PRODUCT_SERVICE_URL as string))
app.use("/api/order",proxy(process.env.ORDER_SERVICE_URL as string))
app.use("/api/ai",isAuth,proxyWithHeaders(process.env.AI_SERVICE_URL as string))
app.get("/api/me",isAuth,getCurrentUser)


const PORT = process.env.PORT || 8000;


app.listen(PORT,()=>{

    console.log(
        `Gateway running on port ${PORT}`
    );

});