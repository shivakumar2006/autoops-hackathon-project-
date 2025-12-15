export const config = {
    name: "OnboardingValidate",
    type: "event",
    description: "Validate onboarding data, emit onboarding-profile-created event",
    subscribes: ["onboarding-validate"],
    emits: ["onboarding-profile-created"],
    flows: ["onboarding-flow"]
};

export const handler = async (input, { emit, logger }) => {
    logger.info("Validatig onboarding : ", { input });

    let interests = [];

    if (Array.isArray(input.interests)) {
        interests = input.interests.map(s => s.trim());
    } else if (typeof input.interests === "string") {
        interests = input.interests.split(",").map(s => s.trim());
    }

    await emit({
        topic: "onboarding-profile-created",
        data: { ...input, interests }
    });
}