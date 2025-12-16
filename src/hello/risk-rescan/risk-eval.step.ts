export const config = {
    name: "risk-eval",
    type: "event",
    subscribes: ["risk-eval"],
    description: "Risk eval job",
    emits: [""],
    flows: ["risk-flow"]
};

export const handler = async ({ data }, { emit, logger }) => {
    const { userId } = data;

    // Fake AI risk scoring (replace with real logic if needed)
    const score = Math.floor(Math.random() * 100);
    const label =
        score > 80 ? "high" :
            score > 40 ? "medium" :
                "low";

    await emit({
        topic: "",
        data: {
            userId,
            riskScore: score,
            riskLabel: label
        }
    });

    logger.info("Risk evaluation completed", {
        userId,
        riskScore: score,
        riskLabel: label
    });
};
