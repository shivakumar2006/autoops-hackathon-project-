export const config = {
    name: "DeadLetterRetryJobWorker",
    type: "event",
    description: "Dead letter retry job Worker",
    subscribes: ["dead-letter-retry"],
    emits: ["payment-validate"],
    flows: ["payment-flow"]
};

export const handler = async (_, { state, emit, logger }) => {
    const dlq = (await state.get("dead-letter")) || [];

    if (dlq.length === 0) {
        logger.info("No messages in dead letter queue");
        return;
    }

    logger.warn("Retry dead letter queue events", { count: dlq.length });

    for (const item of dlq) {
        await emit({
            topic: "payment-validate",
            data: item
        });
    }

    await state.set("dead-letter", []);

    logger.info("Dead letter retry completed - DLQ cleared");
}