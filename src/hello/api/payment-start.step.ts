import { z } from "zod";
import { verifyToken } from "../utils/jwt";
import { ApiRouteConfig } from "motia";

const Body = z.object({
    amount: z.number().positive(),
    currency: z.string().max(6).default("INR"),
    productId: z.string().optional(),
    paymentId: z.string().optional(),
});

export const config: ApiRouteConfig = {
    name: "PaymentStartApi",
    type: "api",
    path: "/payment/start",
    method: "POST",
    description: "Initiate a payment",
    emits: ["payment-validate", "event-failed"],
    flows: ["payment-flow"],
};

export const handler = async (req: any, { emit, logger }: any) => {
    try {
        const authHeader =
            req.headers?.authorization ||
            req.headers?.Authorization ||
            null;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return { status: 401, body: { message: "unauthorized" } };
        }

        const token = authHeader.split(" ")[1];
        const { ok, decoded } = verifyToken(token);

        if (!ok || !decoded?.sub) {
            return { status: 401, body: { message: "invalid token" } };
        }

        const parsed = Body.safeParse(req.body || {});
        if (!parsed.success) {

            // ✅ DLQ fires on validation failure
            await emit({
                topic: "event-failed",
                data: {
                    eventName: "payment-start",
                    payload: req.body,
                    reason: JSON.stringify(parsed.error.format())
                }
            });

            return {
                status: 400,
                body: { message: "invalid payload", errors: parsed.error.format() }
            };
        }

        const payload = {
            userId: decoded.sub,
            amount: parsed.data.amount,
            currency: parsed.data.currency,
            productId: parsed.data.productId || null,
            paymentId: parsed.data.paymentId || `p_${Date.now().toString(36)}`
        };

        logger.info("Payment initiate received", {
            userId: payload.userId,
            amount: payload.amount
        });

        await emit({
            topic: "payment-validate",
            data: payload
        });

        return {
            status: 200,
            body: {
                message: "payment-initiation-queue",
                paymentId: payload.paymentId
            }
        };

    } catch (err: any) {
        logger.error("PaymentStartApi failed", { error: err.message });

        // 🔥 DLQ Emit (runtime errors)
        await emit({
            topic: "event-failed",
            data: {
                eventName: "payment-start",
                payload: req.body,
                reason: String(err.message)
            }
        });

        return {
            status: 500,
            body: { message: "Internal failure, added to DLQ" }
        };
    }
};
