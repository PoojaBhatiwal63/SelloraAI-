import express from "express";
import dotenv from "dotenv";
import aiRouter from "./routes/ai.routes.js";



// load env
dotenv.config();
const app = express();

// middlewares
app.use(express.json());

// health check
app.get("/", (_req, res) => {

    res.json({
        success: true,
        message: "AI Service Running"
    });

});

app.use("/",aiRouter)


// port
const PORT = process.env.PORT || 5004;



const startServer = async () => {

  


    app.listen(PORT, () => {

        console.log(
            `Ai Service running on port ${PORT}`
        );

    });

};


startServer();