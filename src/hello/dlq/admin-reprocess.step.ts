import connectMongo from "../utils/mongo";
import { DLQModel } from "../models/dlq";

export const config = {
    name: "AdminReprocessTrigger",
    type: "api",
    method: "POST",
    path: "/admin/reprocess",
    emits: ["retry-event-execute"],
    flows: ["auto-recovery-flow"]
};

export const handler = async (req, { emit, logger }) => {
    await connectMongo();

    const eventName = req.body.eventName;
    const record = await DLQModel.findOne({ eventName });

    if (!record) {
        return { status: 404, body: { message: "Event not found" } };
    }

    logger.info("Admin reprocessing event:", { eventName });

    await emit({
        topic: "retry-event-execute",
        data: record.payload
    });

    return { status: 200, body: { message: "Reprocess triggered" } };
};
