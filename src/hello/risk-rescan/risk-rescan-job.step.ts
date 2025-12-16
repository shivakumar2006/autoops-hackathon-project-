import { CronConfig } from "motia";
import { UserModel } from "../models/user";

export const config: CronConfig = {
    name: "risk-rescan-job",
    type: "cron",
    cron: "0 3 * * *",
    // subscribes: ["risk-rescan-job"],
    description: "Risk rescan job run daily at 3AM",
    emits: ["risk-eval"],
    flows: ["risk-flow"]
};

export const handler = async (_, { emit, logger }) => {
    const users = await UserModel.find({}).lean();

    logger.info("Risk rescan job started", { totalUsers: users.length });

    for (const user of users) {
        await emit({
            topic: "risk-eval",
            data: {
                userId: user._id.toString(),
            }
        });

        logger.info("Queued risk evaluation", { userId: user._id });
    }
}