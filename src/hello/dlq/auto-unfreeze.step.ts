import connectMongo from "../utils/mongo";
import { UserModel } from "../models/user";

export const config = {
    name: "AutoUnfreezeLogic",
    type: "event",
    description: "Auto unfreeze logic",
    subscribes: ["retry_event_execute"],
    emits: [],
    flows: ["auto-recovery-flow"]
};

export const handler = async (input, { logger }) => {
    await connectMongo();

    if (!input.userId) return;

    await UserModel.updateOne(
        { _id: input.userId },
        { $set: { frozen: false } }
    );

    logger.info("User auto-unfroze:", { userId: input.userId });
};
