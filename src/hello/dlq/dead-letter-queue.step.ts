import connectMongo from "../utils/mongo";
import { DLQModel } from "../models/dlq";

export const config = {
    name: "DeadLetterQueueHandler",
    type: "event",
    description: "Dead letter queue handler",
    subscribes: ["event-failed"],
    emits: ["retry_needed"],
    flows: ["auto-recovery-flow"]
};

export const handler = async (input, { emit, logger }) => {
    await connectMongo();

    await DLQModel.create({
        eventName: input.eventName,
        payload: input.payload,
        reason: input.reason,
        retries: 0,
        status: "FAILED",
        createdAt: new Date()
    });

    logger.error("DLQ entry created", input);

    await emit({
        topic: "retry_needed",
        data: input
    })
}