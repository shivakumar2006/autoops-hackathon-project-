export const config = {
    name: "auto-recovery-flow",
    description: "Auto recovery flow",
    steps: [
        "DeadLetterQueueHandler",
        "RetryEngine",
        "AdminReprocessTrigger",
        "AutoUnfreezeLogic"
    ]
};