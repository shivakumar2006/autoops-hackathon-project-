import { CronConfig } from "motia";
import connectMongo from "../utils/mongo";
import { UserModel } from "../models/user";

export const config: CronConfig = {
    name: "SubscriptionRenewalJob",
    type: "cron",
    cron: "0 1 * * *",
    // subscribes: ["subscription-renewal-job"],
    // schedule: "0 1 * * *", // runs daily at 1AM 
    description: "subscription renewal job run daily at 1AM",
    emits: ["subscription-validate"],
    flows: ["subscription-renewal-flow"]
};

export const handler = async (__, { emit, logger }) => {
    await connectMongo();

    const today = new Date();

    const expiring = await UserModel.find({
        "subscription.active": true,
        "subscription.expiresAt": { $lte: today },
    }).lean();

    for (const user of expiring) {
        logger.info("Subscription renewal triggered", { userId: user._id });

        await emit({
            topic: "subscription-validate",
            data: {
                userId: user._id.toString(),
                email: user.email,
                amount: 299,
                currency: "INR",
                plan: user.subscription?.plan || "basic"
            }
        })
    }
}