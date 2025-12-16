export const config = {
    name: "SubscriptionRiskCheck",
    type: "event",
    description: "Risk scoring engine for subscription renewals",
    subscribes: ["subscription-risk-check"],
    emits: ["subscription-create-payment"],
    flows: ["subscription-renewal-flow"]
};

export const handler = async (input, { emit, logger }) => {
    logger.info("SubscriptionRiskCheck: Evaluating renewal risk", {
        userId: input.userId,
        plan: input.plan,
        amount: input.amount
    });

    let score = 0.05;
    let label = "low";
    let reason = "default";

    const amount = Number(input.amount || 0);
    const renewalAttempts = Number(input.renewalAttempts || 0);
    const lastFailed = Boolean(input.lastFailed);

    // Amount similar to payment fraud logic
    if (amount > 5000) {
        score = randomInRange(0.7, 0.95);
        label = "high";
        reason = "high_subscription_amount";
    } else if (amount > 1000) {
        score = randomInRange(0.3, 0.7);
        label = "mid";
        reason = "mid_subscription_amount";
    }

    // Multiple failed renewals is risky
    if (renewalAttempts > 3) {
        score = randomInRange(0.6, 0.9);
        label = "high";
        reason = "multiple_failed_renewals";
    }

    // Previous attempt failed
    if (lastFailed && label !== "high") {
        score = randomInRange(0.3, 0.6);
        label = "mid";
        reason = "previous_payment_failed";
    }

    // New users renewing for first time (low risk)
    if (input.isFirstRenewal && label === "low") {
        score = randomInRange(0.01, 0.2);
        reason = "first_time_renewal";
    }

    logger.info("SubscriptionRiskCheck: Risk evaluated", {
        score,
        label,
        reason
    });

    await emit({
        topic: "subscription-create-payment",
        data: {
            userId: input.userId,
            plan: input.plan,
            amount,
            score,
            label,
            reason,
            evaluatedAt: new Date().toISOString(),
            modelVersion: "v0.1-motia-ts-renewal"
        }
    });
};

function randomInRange(min: number, max: number) {
    return Number((Math.random() * (max - min) + min).toFixed(2));
}
