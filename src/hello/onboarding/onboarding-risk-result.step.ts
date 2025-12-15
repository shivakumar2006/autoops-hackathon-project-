export const config = {
    name: "OnboardingRiskResult",
    type: "event",
    description: "Onboarding risk result after checking through FraudPythonCheck",
    subscribes: ["risk-evaluated"],
    emits: ["onboarding-email-sent"],
    flows: ["onboarding-flow"]
};

export const handler = async (input, { emit, logger }) => {
    logger.info("Onboarding risk computed", input);

    await emit({
        topic: "onboarding-email-sent",
        data: input
    })
}