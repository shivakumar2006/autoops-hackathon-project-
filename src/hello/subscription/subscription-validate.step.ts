export const config = {
    name: "SubscriptionValidate",
    type: "event",
    subscribes: ["subscription-validate"],
    description: "validate subscription before renewal",
    emits: ["subscription-risk-check"],
    flows: ["subscription-renewal-flow"],
};

export const handler = async (input: any, { emit, logger }) => {
    logger.info("Validating renewal request", input);

    if (!input.userId) return;

    await emit({
        topic: "subscription-risk-check",
        data: input
    })
}