import { z } from "zod";
import { verifyToken } from "../utils/jwt";

const Body = z.object({
    gender: z.object().optional(),
    age: z.number().optional(),
    bio: z.string().optional(),
    interests: z.union([z.array(z.string()), z.string()]).optional()
});

export const config = {
    name: "OnboardingStart",
    type: "api",
    path: "/onboarding/start",
    method: "POST",
    description: "Start onboarding process, emit onboarding-start event",
    emits: ["onboarding-validate"],
    flows: ["onboarding-flow"]
};

export const handler = async (req: any, { emit, logger }) => {
    logger.info("Onboarding starts");
    const authHeader =
        req.headers?.authorization ||
        req.headers?.Authorization ||
        req.headers?.Authorization ||
        req.headers?.authorization ||
        null;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { status: 401, body: { message: "UnAuthorized" } };
    }

    const token = authHeader.split(" ")[1];
    const { ok, decoded } = verifyToken(token);

    if (!ok || !decoded?.sub) {
        return { status: 401, body: { message: "Invalid token" } };
    }

    const parsed = Body.safeParse(req.body);
    if (!parsed.success) {
        return { status: 400, body: { message: "Invalid payloads" } };
    }

    const payload = {
        userId: decoded.sub,
        ...parsed.data
    }

    await emit({
        topic: "onboarding-validate",
        data: payload
    })

    return { status: 200, body: { message: "onboarding-started" } };
}