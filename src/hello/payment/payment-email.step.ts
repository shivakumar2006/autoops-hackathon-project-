export const config = {
    name: "PaymentReceiptSent",
    type: "event",
    description: "Send receipt to user",
    subscribes: ["payment-receipt-sent"],
    emits: ["payment-completed"],
    flows: ["payment-flow"]
};

export const handler = async (input, { emit, logger }) => {
    logger.info("Sending payment receipt", { paymentId: input.paymentId, invoiceId: input.invoiceId });

    await new Promise(resolve => setTimeout(resolve, 150));

    logger.info("Receipt payment sent", { paymentId: input.paymentId });

    await emit({
        topic: "payment-completed",
        data: input,
    })
} 