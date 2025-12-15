import { CronConfig } from "motia";

export const config: CronConfig = {
    name: "DeadLetterRetryJob",
    type: "cron",
    cron: "*/5 * * * *",
    description: "Trigger dead letter retry every 5 minutes",
    emits: ["dead-letter-retry"],
    flows: ["payment-flow"]
};

export const handler = async ({ logger }) => {
    logger.info("Triggering dead letter retry job");

    return;
};