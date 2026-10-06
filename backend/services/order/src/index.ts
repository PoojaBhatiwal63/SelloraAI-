import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./configs/db.js";
import orderRouter from "./routes/order.route.js";
import "./configs/email.worker.js"
// load env
dotenv.config();
const app = express();

// middlewares
app.use(express.json());

// health check
app.get("/", (_req, res) => {

    res.json({
        success: true,
        message: "Order Service Running"
    });

});


// port
const PORT = process.env.PORT || 5003;

app.use("/",orderRouter)


const startServer = async () => {

    await connectDb();


    app.listen(PORT, () => {

        console.log(
            `Order Service running on port ${PORT}`
        );

    });

};


startServer();