export const config = {
    name: "OnboardingSendEmail",
    type: "event",
    description: "send onboarding email for successfully onboard the user",
    subscribes: ["onboarding-email-sent"],
    emits: ["onboarding-completed"],
    flows: ["onboarding-flow"]
};

export const handler = async (input, { emit }) => {
    await new Promise(response => setTimeout(response, 200));

    await emit({
        topic: "onboarding-completed",
        data: input
    })
}