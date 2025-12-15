import connectMongo from "../utils/mongo";
import { PaymentModel } from "../models/payment";

export const config = {
    name: "PaymentConfirm",
    type: "event",
    description: "Confirm payment",
    subscribes: ["payment-confirmed"],
    emits: ["payment-invoice-generated"],
    flows: ["payment-flow"]
};

export const handler = async (input: any, { emit, logger }) => {
    await connectMongo();

    const txId = `tx_${Date.now().toString(36)}_${Math.floor(Math.random() * 9000 + 1000)}`;

    await PaymentModel.updateOne(
        { paymentId: input.paymentId },
        {
            $set: {
                status: "CONFIRMED",
                transactionId: txId,
                updatedAt: new Date().toISOString()
            }
        }
    )

    logger.info("Payment confirmed", { paymentId: input.paymentId, transactionId: txId });

    await emit({
        topic: "payment-invoice-generated",
        data: {
            paymentId: input.paymentId,
            transactionId: txId,
        }
    })
}