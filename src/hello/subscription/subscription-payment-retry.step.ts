export const config = {
    name: "SubscriptionPaymentRetry",
    type: "event",
    subscribes: ["subscription-payment-retry"],
    description: "Retry subscription payment",
    emits: ["subscription-invoice-generate"],
    flows: ["subscription-renewal-flow"]
};

export const handler = async (input, { emit, logger }) => {
    const success = Math.random() > 0.2; // 80% sucess mock 

    logger.info("Attempting subscription payment", {
        paymentId: input.paymentId,
        success
    });

    if (!success) {
        logger.warn("payment retry failed")
    }

    await emit({
        topic: "subscription-invoice-generate",
        data: { ...input, success }
    })
}