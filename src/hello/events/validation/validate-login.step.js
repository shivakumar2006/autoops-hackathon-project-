export const config = {
    name: "ValidateLoginJS",
    type: "event",
    description: "Async login validation",
    subscribes: ["validate-login"],
    emits: ["user-logged-in"],
    flows: ["auth-flow"],
    input: {
        type: "object",
        properties: {},
        additionalProperties: true
    }
};

export const handler = async (input, { logger, emit }) => {
    logger.info("validate-login.js received", { input });

    // await call("FraudCheckPython", {
    //     ...input,
    //     eventType: "login"
    // });

    await emit({
        topic: "user-logged-in",
        data: {
            ...input,
            checkedAt: new Date().toISOString()
        }
    });
};
