import connectMongo from "../utils/mongo";
import { PaymentModel } from "../models/payment";

export const config = {
    name: "PaymentCompleted",
    type: "event",
    subscribes: ["payment-completed"],
    description: "payment completed",
    emits: [],
    flows: ["payment-flow"],
};

export const handler = async (input: any, { logger }) => {
    await connectMongo();

    await PaymentModel.updateOne(
        { paymentId: input.paymentId },
        { $set: { status: "COPLETED", updatedAt: new Date().toISOString() } }
    );

    logger.info("payment flow completed", { paymentId: input.paymentId });
}