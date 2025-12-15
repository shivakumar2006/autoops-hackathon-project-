import { PaymentModel } from "../models/payment";

export const config = {
    name: "PaymentReconciliationJobWorker",
    type: "event",
    description: "Payment reconciliation job worker",
    subscribes: ["payment-recon"],
    emits: ["payment-validate"],
    flows: ["payment-flow"]
};

export const handler = async (_, { emit, logger }) => {
    const stuckPayment = await PaymentModel.find({ status: { $in: ["INITIATED", "FAILED"] } });

    logger.info("Found stuck payments", { count: stuckPayment.length });

    for (const payment of stuckPayment) {
        logger.warn("Retrying payment validation", {
            paymentId: payment.paymentId,
            userId: payment.userId,
            status: payment.status
        });

        await emit({
            topic: "payment-validate",
            data: {
                userId: payment.userId,
                paymentId: payment.paymentId,
                amount: payment.amount,
                currency: payment.currency,
                productId: payment.productId,
                riskScore: payment.riskScore,
                riskLabel: payment.riskLabel,
                transactionId: payment.transactionId,
                invoiceId: payment.invoiceId
            }
        })
    }
}