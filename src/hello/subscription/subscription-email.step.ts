export const config = {
    name: "SubscriptionSendEmail",
    type: "event",
    subscribes: ["subscription-email-send"],
    description: "send email for subscription renewal",
    emits: ["subscription-renewal-finalize"],
    flows: ["subscription-renewal-flow"]
};

export const handler = async (input, { emit, logger }) => {
    logger.info("Email send to user", { email: input.email });

    await emit({
        topic: "subscription-renewal-finalize",
        data: input
    })
}