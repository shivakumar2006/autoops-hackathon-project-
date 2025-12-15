export const config = {
    name: "FraudPaymentRiskCheck",
    type: "event",
    subscribes: ["payment-risk-scanned"],
    description: "payment risk check using (typescript version)",
    emits: ["payment-fraud-check"],
    flows: ["payment-flow"],
};

export const handler = async (input, { logger, emit }) => {
    logger.info("Calling fraud engine for payment", { paymentId: input.paymentId });

    // try {
    //     await call("FraudCheckPython", {
    //         paymentId: input.paymentId,
    //         amount: input.amount,
    //         userId: input.userId,
    //         currency: input.currency,
    //         eventType: "payment",
    //     });
    // } catch (error) {
    //     logger.warn("Fraud engine call falied", { err: error?.message || error });
    // }

    await emit({
        topic: "payment-fraud-check",
        data: input
    })
}