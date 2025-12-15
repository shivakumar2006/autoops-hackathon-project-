export const config = {
    name: "OnboardingMetadataStored",
    type: "event",
    description: "Store onboarding metadata, emit onboarding-risk-check event",
    subscribes: ["onboarding-metadata-stored"],
    emits: ["onboarding-risk-check"],
    flows: ["onboarding-flow"]
};

export const handler = async (input, { emit, logger, state }) => {
    logger.info("Storing onboarding metadata", { input });

    // await state.set(`onboarding:${input.userId}`, input);

    await emit({ topic: "onboarding-risk-check", data: input });
}   