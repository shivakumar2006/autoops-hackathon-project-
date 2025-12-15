export const config = {
    name: "PaymentValidate",
    type: "event",
    description: "Validate payment details",
    subscribes: ["payment-validate"],
    emits: ["payment-created"],
    flows: ["payment-flow"]
};

export const handler = async (input, { emit, logger }) => {
    logger.info("Payment validate received", { userId: input.userId, amount: input.amount });

    if (!input.amount || input.amount <= 0) {
        logger.warn("Invalid amount", { amount: input.amount });
    }

    if (input.amount > 1_00_000) {
        logger.warn("Suspeciously large amount", { amount: input.amount });
    }

    await emit({
        topic: "payment-created",
        data: input
    })
}