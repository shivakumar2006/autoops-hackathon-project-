import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export function signToken(payload: Record<string, any>) {
    return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string) {
    try {
        const decoded = jwt.verify(token, SECRET) as Record<string, any>;
        return { ok: true, decoded };
    } catch (err) {
        return { ok: false, error: err };
    }
}