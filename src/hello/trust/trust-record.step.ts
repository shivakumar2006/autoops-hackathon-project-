import connectMongo from "../utils/mongo";
import { TrustHistoryModel } from "../models/trust-history";

export const config = {
    name: "TrustRecord",
    type: "event",
    description: "Stores trust score changes for insights",
    subscribes: ["trust-updated"],
    emits: [],
    flows: ["trust-flow"]
};

export const handler = async (input, { logger }) => {
    await connectMongo();

    await TrustHistoryModel.create({
        userId: input.userId,
        riskLabel: input.riskLabel,
        riskScore: input.riskScore,
        trustChange: input.trustChange,
        newScore: input.newScore,
        frozen: input.frozen,
        reason: input.reason,
        createdAt: new Date()
    });

    logger.info("TrustRecord: Trust history logged", input);
};
