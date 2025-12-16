import connectMongo from "../utils/mongo";
import { UserModel } from "../models/user";

export const config = {
    name: "SubscriptionFinalize",
    type: "event",
    subscribes: ["subscription-renewal-finalize"],
    description: "finalize subscription renewal",
    emits: [],
    flows: ["subscription-renewal-flow"],
};

export const handler = async (input, { logger }) => {
    await connectMongo();

    await UserModel.updateOne(
        { _id: input.userId },
        {
            $set: {
                "subscription.expiresAt": new Date(Date.now() + 30 * 24 * 3600 * 1000)
            }
        }
    )

    logger.info("Subscription renewal successfully", input);
}