import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./configs/db.js";
import productRouter from "./routes/product.route.js";
// load env
dotenv.config();
const app = express();

// middlewares
app.use(express.json());

// health check
app.get("/", (_req, res) => {

    res.json({
        success: true,
        message: "Product Service Running"
    });

});


// port
const PORT = process.env.PORT || 5002;

app.use("/",productRouter)

const startServer = async () => {

    await connectDb();


    app.listen(PORT, () => {

        console.log(
            `Product Service running on port ${PORT}`
        );

    });

};


startServer();