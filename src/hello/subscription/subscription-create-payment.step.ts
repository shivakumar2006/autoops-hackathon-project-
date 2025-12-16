import connectMongo from "../utils/mongo";
import { PaymentModel } from "../models/payment";

export const config = {
    name: "SubscriptionCreatePayment",
    type: "event",
    subscribes: ["subscription-create-payment"],
    description: "create payment for subscription renewal",
    emits: ["subscription-payment-retry"],
    flows: ["subscription-renewal-flow"]
};

export const handler = async (input, { logger, emit }) => {
    await connectMongo();

    const paymentId = `subpay_${Date.now()}`;

    await PaymentModel.create({
        userId: input.userId,
        paymentId,
        amount: input.amount,
        currency: input.currency,
        status: "INITIATED",
        createdAt: new Date()
    });

    logger.info("subscription payment created", { paymentId });

    await emit({
        topic: "subscription-payment-retry",
        data: { ...input, paymentId }
    })
}