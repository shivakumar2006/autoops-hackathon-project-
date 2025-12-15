import { Schema, model, Document } from "mongoose";

export interface IPayment extends Document {
    userId: string;
    amount: number;
    currency: string;
    productId?: string | null;
    paymentId: string;
    status: "INITIATED" | "CONFIRMED" | "FAILED" | "COMPLETED";
    riskScore?: number;
    riskLabel?: string;
    transactionId?: string | null;
    invoiceId?: string | null;
    createdAt: string;
    updatedAt?: string;
}

const PaymentSchema = new Schema<IPayment>({
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    productId: { type: String, default: null },
    paymentId: { type: String, required: true, unique: true, index: true },
    status: { type: String, default: "INITIATED" },
    riskScore: Number,
    riskLabel: String,
    transactionId: String,
    invoiceId: String,
    createdAt: { type: String, required: true },
    updatedAt: String
});

export const PaymentModel = model<IPayment>("Payment", PaymentSchema);
