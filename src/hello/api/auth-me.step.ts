import { verifyToken } from "../utils/jwt";
import connectMongo from "../utils/mongo";
import { UserModel } from "../models/user";

export const config = {
    name: "AuthMeAPI",
    type: "api",
    path: "/auth/me",
    method: "GET",
    description: "Return current user profile, Requires authorization:",
    flows: ["auth-flow"],
    emits: [],  // REQUIRED


    // output: {
    //     type: "object",
    //     properties: {
    //         userId: { type: "string" },
    //         email: { type: "string" },
    //         name: { type: "string" },
    //         roles: { type: "array", items: { type: "string" } },
    //         status: { type: "string" },
    //         riskSummary: { type: "object" }
    //     }
    // }
}

export const handler = async (req: any, { logger, call }: any) => {

    logger.info("AUTH ME HEADERS:", req.headers);


    const authHeader = req.headers?.authorization ||   // correct
        req.headers?.Authorization ||   // fallback
        req.headers?.AUTHORIZATION ||   // fallback
        null;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { status: 401, body: { message: "Unauthorized" } };
    }
    const token = authHeader.split(" ")[1];

    const { ok, decoded, error } = verifyToken(token);
    if (!ok) {
        logger.warn("Invalid token", { error: error?.message || error });
        return { status: 401, body: { message: "Invalid token" } }
    }

    const sub = decoded?.sub;
    if (!sub) {
        return { status: 401, body: { message: "Invalid token payload" } };
    }

    await connectMongo();
    const user = await UserModel.findById(sub).lean();
    if (!user) {
        return { status: 404, body: { message: "User not found" } };
    }

    // Optional: call fraud scanner non-blocking (for telemetry)
    try {
        await call("FraudCheckPython", { userId: user._id.toString(), email: user.email, eventType: "profile_view" });
    } catch (err) {
        logger.warn("fraud call (profile) failed", { err: err?.message || err });
    }

    return {
        status: 200,
        body: {
            userId: user._id.toString(),
            email: user.email,
            name: user.name,
            roles: user.roles,
            status: user.status,
            riskSummary: user.riskSummary || null,
        },
    };

}