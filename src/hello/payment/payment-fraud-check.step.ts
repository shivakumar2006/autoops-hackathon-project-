
export const config = {
    name: "PaymentFraudCheck",
    type: "event",
    description: "Fraud scoring engine for payments (TS version)",
    subscribes: ["payment-fraud-check"],
    emits: ["payment-confirmed", "risk-evaluated"],
    flows: ["payment-flow"]
};

export const handler = async (input, { emit, logger }) => {

    let topic = "payment-risk-scanned";

    const amount = Number(input.amount || 0);

    let score = 0.05;
    let label = "low";
    let reason = "default";

    if (amount > 10000) {
        score = Number((Math.random() * (0.95 - 0.6) + 0.6).toFixed(2));
        label = "high";
        reason = "high_amount";
    } else if (amount > 1000) {
        score = Number((Math.random() * (0.6 - 0.2) + 0.2).toFixed(2));
        label = "mid";
        reason = "mid_amount";
    } else {
        score = Number((Math.random() * (0.25 - 0.01) + 0.01).toFixed(2));
        label = "low";
        reason = "low_amount";
    }

    logger.info("PaymentFraudCheck: Computed fraud score", {
        amount,
        score,
        label,
        reason
    });

    // first trust engine 
    await emit({
        topic: "risk-evaluated",
        data: {
            userId: input.userId,
            paymentId: input.paymentId,
            score,
            label,
            reason,
            evaluatedAt: new Date().toISOString(),
            sourceTopic: "payment-fraud-check",
            modelVersion: "v0.1-payment-ts"
        }
    });

    // then normal go to normal step
    await emit({
        topic: "payment-confirmed",
        data: {
            paymentId: input.paymentId,
            amount,
            score,
            label,
            reason,
            evaluatedAt: new Date().toISOString(),
            modelVersion: "v0.1-motia-ts"
        }
    });
};
