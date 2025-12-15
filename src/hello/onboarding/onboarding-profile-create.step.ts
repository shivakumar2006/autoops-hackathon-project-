import connectMongo from "../utils/mongo";
import { UserModel } from "../models/user";

export const config = {
    name: "OnboardingProfileCreated",
    type: "event",
    description: "Create user profile, emit onboarding-metadata-stored event",
    subscribes: ["onboarding-profile-created"],
    emits: ["onboarding-metadata-stored"],
    flows: ["onboarding-flow"]
};

export const handler = async (input: any, { logger, emit }) => {
    logger.info("Creating user profile", { input });

    await connectMongo();

    const userId = input.userId;
    logger.info("Creating/merging onboarding profile", { userId });

    await UserModel.updateOne(
        { _id: userId },
        {
            $set: {
                onboarding: {
                    gender: input.gender || null,
                    age: input.age || null,
                    bio: input.bio || null,
                    interests: input.interests || [],
                    completed: false
                }
            }
        },
        { upsert: true }
    )

    await emit({
        topic: "onboarding-metadata-stored",
        data: {
            userId,
            gender: input.gender || null,
            age: input.age || null,
            bio: input.bio || null,
            interests: input.interests || [],
        }
    })
}