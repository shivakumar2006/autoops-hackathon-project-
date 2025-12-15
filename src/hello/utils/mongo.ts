import mongoose from "mongoose";

const connectMongo = async (mongoUri?: string) => {
    const uri = mongoUri || process.env.MONGO_URI || "mongodb://localhost:27017";
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    await mongoose.connect(uri, {

    } as any);
    return mongoose.connection;
}

export default connectMongo;