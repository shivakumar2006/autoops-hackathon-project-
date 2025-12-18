import connectMongo from "../utils/mongo";
import { UserModel } from "../models/user";

export const config = {
    name: "TrustEngine",
    type: "event",
    description: "Calculate trust score change from fraud engine",
    subscribes: ["risk-evaluated"],
    emits: ["trust-updated"],
    flows: ["trust-flow"]
};

export const handler = async (input: any, { emit, logger }) => {
    await connectMongo();

    const { userId, score, label, reason } = input;

    if (!userId) {
        logger.warn("TrustEngine: user id not found, skipping");
        return;
    }

    // default trust score if missing 
    let user = await UserModel.findById(userId)
    if (!user) {
        return;
    }

    const previous = user.trustScore ?? 50;

    // trust score impact logic
    let trustChange = 0;

    if (label === "high") {
        trustChange = -25;
    } else if (label === "mid") {
        trustChange = -10;
    } else {
        trustChange = +5;
    }

    const newScore = Math.max(0, Math.min(100, previous + trustChange));

    // auto freeze and unfreeze 
    let frozen = user.frozen ?? false;

    if (newScore <= 20) frozen = true;
    if (newScore > 40 && frozen) frozen = false;

    await UserModel.updateOne(
        { _id: userId },
        {
            $set: {
                trustScore: newScore,
                frozen
            }
        }
    );

    logger.info("TrustEngine: trust score updated", {
        userId,
        previous,
        trustChange,
        newScore,
        frozen,
        reason
    });

    await emit({
        topic: "trust-updated",
        data: {
            userId,
            previous,
            trustChange,
            newScore,
            frozen,
            reason,
            riskLabel: label,
            riskScore: score,
            createdAt: new Date()
        }
    });
}