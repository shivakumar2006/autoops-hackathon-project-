import connectMongo from "../utils/mongo";
import { PaymentModel } from "../models/payment";

export const config = {
    name: "PaymentInvoice",
    type: "event",
    description: "Generate invoice for payment",
    subscribes: ["payment-invoice-generated"],
    emits: ["payment-receipt-sent"],
    flows: ["payment-flow"]
};

export const handler = async (input: any, { emit, logger }) => {
    await connectMongo();

    const invoiceId = `inv_${Date.now().toString(36)}`;

    await PaymentModel.updateOne(
        { paymentId: input.paymentId },
        {
            $set: {
                invoiceId,
                updatedAt: new Date().toISOString()
            }
        }
    )

    logger.info("Invoice generated", { paymentId: input.paymentId, invoiceId });

    await emit({
        topic: "payment-receipt-sent",
        data: {
            paymentId: input.paymentId,
            invoiceId
        }
    })
}