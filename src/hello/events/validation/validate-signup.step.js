export const config = {
    name: "ValidateSignupJS",
    type: "event",
    description: "Asynchronous signup validation",
    subscribes: ["validate-signup"],
    emits: ["user-signed-up"],
    flows: ["auth-flow"],
    input: {
        type: "object",
        properties: {
            userId: { type: "string" },
            email: { type: "string" },
            name: { type: "string" },
        },
        required: ["userId", "email", "name"]
    }
};

export const handler = async (input, { logger, emit, call }) => {
    try {
        const { userId, email } = input;

        logger.info("Running signup validation");

        await call("FraudCheckPython", {
            ...input,
            eventType: "signup"
        });

        await emit({
            topic: "user-signed-up",
            data: { userId, email, name: input.name }
        });

        logger.info("Emitted user-signed-up", { userId });
    } catch (err) {
        logger.warn('validate-signup.js error', { err: err?.message || err });
    }
}