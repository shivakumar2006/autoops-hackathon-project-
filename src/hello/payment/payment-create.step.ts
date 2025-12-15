import connectMongo from "../utils/mongo";
import { PaymentModel } from "../models/payment";

export const config = {
    name: "PaymentCreate",
    type: "event",
    subscribes: ["payment-created"],
    description: "Payment created",
    emits: ["payment-risk-scanned"],
    flows: ["payment-flow"]
};

export const handler = async (input: any, { logger, emit }) => {
    await connectMongo();

    const now = new Date().toISOString();

    const doc = {
        userId: input.userId,
        amount: input.amount,
        currency: input.currency || "INR",
        productId: input.productId || null,
        paymentId: input.paymentId,
        status: "INITIATED",
        transactionId: null,
        invoiceId: null,
        createdAt: now
    }

    // upsert to avoid duplicates 
    await PaymentModel.updateOne({ paymentId: doc.paymentId }, { $setOnInsert: doc }, { upsert: true });

    logger.info("Payment document created : ", { paymentId: doc.paymentId, userId: doc.userId });

    await emit({
        topic: "payment-risk-scanned",
        data: { paymentId: doc.paymentId, ...input }
    });
}