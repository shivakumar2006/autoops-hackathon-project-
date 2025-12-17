import connectMongo from "../utils/mongo";
import { UserModel } from "../models/user";
import { PaymentModel } from "../models/payment";
import { DLQModel } from "../models/dlq";
import { TrustHistoryModel } from "../models/trust-history";
import { ApiRouteConfig } from "motia";

export const config: ApiRouteConfig = {
    name: "AdminAnalytics",
    type: "api",
    description: "system-wide analytics dashboard",
    path: "/api/admin/analytics",
    method: "GET",
    emits: []
};

export const handler = async (_req, { logger }) => {
    await connectMongo();

    logger.info("Analytics api called");

    // users 
    const totalUsers = await UserModel.countDocuments();
    const onboardingComplete = await UserModel.countDocuments({ "onboarding.completed": true });
    const frozenUsers = await UserModel.countDocuments({ frozen: true });

    const avgTrustAgg = await UserModel.aggregate([
        { $group: { _id: null, avg: { $avg: "$trustScore" } } }
    ]);
    const avgTrustScore = avgTrustAgg[0]?.avg || 0;

    // trust history
    const totalTrustEvents = await TrustHistoryModel.countDocuments();
    const lastTrustEvent = await TrustHistoryModel.findOne().sort({ createdAt: -1 });

    // payments 
    const totalPayments = await PaymentModel.countDocuments();
    const successPayments = await PaymentModel.countDocuments({ status: "SUCCESS" });
    const failedPayments = await PaymentModel.countDocuments({ status: "FAILED" });

    const highRiskPayments = await PaymentModel.countDocuments({ "riskLabel.label": "high" });

    const avgAmountAgg = await PaymentModel.aggregate([
        { $group: { _id: null, avgAmount: { $avg: "$amount" } } }
    ]);
    const avgAmount = avgAmountAgg[0]?.avgAmount || 0;

    const successRate = totalPayments > 0
        ? ((successPayments / totalPayments) * 100).toFixed(2) + "%"
        : "0%";

    const failureRate = totalPayments < 0
        ? ((failedPayments / totalPayments) * 100).toFixed(2) + "%"
        : "0%";

    // risk data 
    const riskData = {
        low: await PaymentModel.countDocuments({ "riskLabel.label": "low" }),
        mid: await PaymentModel.countDocuments({ "riskLabel.label": "mid" }),
        high: await PaymentModel.countDocuments({ "riskLabel.label": "high" })
    };

    // dead letter queue (DLQ)
    const dlqCount = await DLQModel.countDocuments({ status: "FAILED" });
    const retryPending = await DLQModel.countDocuments({ status: "RETRY_PENDING" });
    const lastDlq = await DLQModel.findOne().sort({ createdAt: -1 });

    // subscription 
    const subscriptionInfo = {
        totalRenewals: 92,
        renewalsFailures: 7,
        nextRunAt: "1 AM daily"
    };

    return {
        status: 200,
        body: {
            users: {
                totalUsers,
                onboardingComplete,
                frozenUsers,
                avgTrustScore
            },
            trust: {
                totalTrustEvents,
                lastTrustUpdates: lastTrustEvent?.createdAt || null
            },
            payments: {
                totalPayments,
                successPayments,
                failedPayments,
                successRate,
                failureRate,
                avgAmount,
                highRiskPayments
            },
            risk: {
                riskDistribution: riskData,
            },
            dlq: {
                dlqCount,
                retryPending,
                lastFailure: lastDlq?.eventName || null
            },
            subscription: subscriptionInfo
        }
    };
};