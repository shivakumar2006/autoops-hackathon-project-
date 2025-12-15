export const config = {
    name: "OnboardingRiskCheck",
    type: "event",
    subscribes: ["onboarding-risk-check"],
    description: "onboarding risk check starts for fraudCheckPython",
    emits: ["onboarding-risk-result"],
    flows: ["onboarding-flow"]
};

export const handler = async (input, { emit, logger }) => {
    logger.info("Queueing onboarding risk evaluation", { userId: input.userId });

    await emit({
        topic: "onboarding-risk-result",
        data: input
    })
}