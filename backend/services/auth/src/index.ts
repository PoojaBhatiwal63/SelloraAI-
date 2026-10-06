import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";


// load env
dotenv.config();
import { connectDb } from "./configs/db.js";
import authRouter from "./routes/auth.route.js";



const app = express();


// middlewares
app.use(express.json());

app.use(cookieParser());


// health check
app.get("/", (_req, res) => {

    res.json({
        success: true,
        message: "Auth Service Running"
    });

});


// port
const PORT = process.env.PORT || 5001;

app.use("/",authRouter)

const startServer = async () => {

    await connectDb();


    app.listen(PORT, () => {

        console.log(
            `Auth Service running on port ${PORT}`
        );

    });

};


startServer();