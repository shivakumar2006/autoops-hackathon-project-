import { CronConfig } from "motia";

export const config: CronConfig = {
    name: "PaymentReconciliationJob",
    type: "cron",
    cron: "*/30 * * * *",
    description: "Trigger reconciliation event every 30 minutes",
    emits: ["payment-recon"],
    flows: ["payment-flow"]
};

export const handler = async ({ logger }) => {
    logger.info("Triggering payment reconciliation job");
    return;
}