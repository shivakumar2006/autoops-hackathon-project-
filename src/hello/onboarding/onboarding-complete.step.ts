import connectMongo from "../utils/mongo";
import { UserModel } from "../models/user";

export const config = {
    name: "OnboardingComplete",
    type: "event",
    description: "onboarding completed",
    subscribes: ["onboarding-completed"],
    emits: [],
    flows: ["onboarding-flow"]
};

export const handler = async (input, { logger }) => {
    logger.info("Onboarding user store in Database");

    await connectMongo();

    await UserModel.updateOne(
        { _id: input.userId },
        {
            $set: {
                "onboarding.completed": true,
                "onboarding.completedAt": new Date().toISOString()
            }
        }
    )

    logger.info("Onboarding finalized", { userId: input.userId });
}