import mongoose from "mongoose";

const DLQSchema = new mongoose.Schema({
    eventName: String,
    payload: Object,
    reason: String,
    retries: Number,
    status: String,
    createdAt: Date
});

export const DLQModel = mongoose.model("DLQ", DLQSchema);