import mongoose from "mongoose";


export const connectDb = async (): Promise<void> => {

    try {

        await mongoose.connect(
            process.env.MONGODB_URL!
        );

        console.log("MongoDB Connected");

    } catch (error) {

        console.error(
            "Error connecting to MongoDB:",
            error
        );

    
    }
};