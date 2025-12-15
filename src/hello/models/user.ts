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
    }
}