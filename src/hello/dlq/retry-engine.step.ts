import connectMongo from "../utils/mongo";
import { DLQModel } from "../models/dlq";

export const config = {
    name: "RetryEngine",
    type: "event",
    description: "Retry engine with delayed job emit",
    subscribes: ["retry_needed"],
    emits: ["retry_event_execute", "retry_failed"],
    flows: ["auto-recovery-flow"]
};

function delay(attempt: number) {
    return Math.min(60000, Math.pow(2, attempt) * 1000);
}

export const handler = async (input, { logger, emit }) => {
    await connectMongo();

    const record = await DLQModel.findOne({ eventName: input.eventName });
    if (!record) return;

    if (record.retries >= 5) {
        logger.error("Max retries reached — marking failed", record);
        await emit({
            topic: "retry_failed",
            data: input
        });
        return;
    }

    const wait = delay(record.retries);
    logger.info("Retry scheduled", { wait });

    await emit({
        topic: "retry_event_execute",
        data: record.payload,
        metadata: {
            delay: wait
        }
    });

    record.retries++;
    await record.save();
};
