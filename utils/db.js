import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            dbName: "ecommerce_2",
        });
        console.log("DB connected successfully");
    } catch (error) {
        console.log("Error in DB connection", error);
    }
};


export default connectDb;