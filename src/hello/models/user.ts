import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
    email: string;
    name: string;
    passwordHash: string;
    roles: string[];
    status: string;
    createdAt: Date;
    updatedAt: Date;
    riskSummary?: {
        latestScore?: number;
        latestLabel?: string;
        evaluatedAt?: Date;
    };

    subscriptions?: {
        plan: string;
        status: "active" | "expired" | "cancelled";
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        renewalAttempts: number;

        history?: {
            transactionId: string;
            invoiceId: string;
            amount: number;
            renewedAt: Date;
        }[];
    };
}

const UserSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true, index: true },
        name: { type: String, required: true },
        passwordHash: { type: String, required: true },
        roles: { type: [String], default: ["User"] },
        status: { type: String, default: "Active" },
        riskSummary: {
            latestScore: Number,
            latestLabel: String,
            evaluatedAt: Date,
        },
        subscriptions: {
            plan: { type: String, default: "basic" },
            status: { type: String, default: "active" },
            currentPeriodStart: { type: Date },
            currentPeriodEnd: { type: Date },
            renewalEnable: { type: Boolean, default: true },
            renewalAttempts: { type: Number, default: 0 },

            history: [
                {
                    transactionId: String,
                    invoiceId: String,
                    amount: Number,
                    renewedAt: Date,
                }
            ]
        }
    },
    { timestamps: true }
)

export const UserModel = model<IUser>("User", UserSchema);