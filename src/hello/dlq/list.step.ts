import connectMongo from "../utils/mongo";
import { DLQModel } from "../models/dlq";
import { ApiRouteConfig } from "motia";

export const config: ApiRouteConfig = {
    name: "AdminDLQList",
    type: "api",
    method: "GET",
    path: "/admin/dlq",
    emits: [],
    flows: ["auto-recovery-flow"]
};

export const handler = async (_req, _ctx) => {
    await connectMongo();

    const dlqRecords = await DLQModel.find().sort({ createdAt: -1 });

    return {
        status: 200,
        body: dlqRecords
    }
}