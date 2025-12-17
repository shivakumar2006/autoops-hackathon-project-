import mongoose from "mongoose";

const TrustHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    riskLabel: String,
    riskScore: Number,
    trustChange: Number,
    newScore: Number,
    frozen: Boolean,
    reason: String,
    createdAt: { type: Date, default: Date.now }
});

export const TrustHistoryModel = mongoose.models.TrustHistory || mongoose.model("TrustHistory", TrustHistorySchema);