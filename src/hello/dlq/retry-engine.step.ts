import connectMongo from "../utils/mongo";
import { DLQModel } from "../models/dlq";

export const config = {
    name: "RetryEngine",
    type: "event",
    description: "Retry engine",
    subscribes: ["retry-needed"],
    emits: ["retry-event-execute", "retry-failed"],
    flows: ["auto-recovery-flow"]
};

function delay(attempt) {
    return Math.min(60000, Math.pow(2, attempt) * 1000);
}

export const handler = async (input, { logger, emit }) => {
    await connectMongo();

    const record = await DLQModel.findOne({ eventName: input.eventName });

    if (!record) return;

    if (record.retries >= 5) {
        logger.error("Max retries reached — marking failed", record);
        await emit({ topic: "retry-failed", data: input });
        return;
    }

    const wait = delay(record.retries);

    logger.info("Retrying event in ms:", { wait });

    setTimeout(async () => {
        await emit({
            topic: "retry-event-execute",
            data: record.payload
        });
    }, wait);

    record.retries++;
    await record.save();
};