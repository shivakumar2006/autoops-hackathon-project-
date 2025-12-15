import bcrypt from "bcrypt";
import { z } from "zod";
import connectMongo from "../utils/mongo";
import { UserModel } from "../models/user";
import { signToken } from "../utils/jwt";

const LoginBody = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export const config = {
    name: "LoginAPI",
    type: "api",
    path: "/auth/login",
    method: "POST",
    description: "Login user, emit login events, return jwt",
    emits: ["validate-login", "user-logged-in"],
    flows: ["auth-flow"],

    // input: LoginBody,

    // output: {
    //     type: "object",
    //     properties: {
    //         token: { type: "string" },
    //         userId: { type: "string" },
    //         status: { type: "string" }
    //     }
    // }
}

export const handler = async (req: any, { emit, logger }: any) => {
    const parsed = LoginBody.safeParse(req.body);
    if (!parsed.success) {
        return { status: 400, body: { message: "Invalid payload" } };
    }
    const { email, password } = parsed.data;

    await connectMongo();

    const user = await UserModel.findOne({ email });
    if (!user) {
        logger.warn("login failed: user not found", { email })
        await emit({ topic: "validate-login", data: { email, ok: false } });
        return { status: 404, body: { message: "user not found" } };
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
        logger.warn("login failed: invalid password", { email });
        await emit({ topic: "validate-login", data: { userId: user._id.toString(), email, ok: false } });
        return { status: 401, body: { message: "invalid credentials" } }
    }

    await emit({
        topic: "validate-login",
        data: {
            userId: user._id.toString(),
            email: user.email,
            ok: true,
        }
    });

    await emit({
        topic: "user-logged-in",
        data: {
            userId: user._id.toString(),
            email: user.email,
            loggedAt: new Date().toISOString(),
        }
    });

    const token = signToken({
        sub: user._id.toString(),
        email: user.email,
        roles: user.roles,
    });

    return { status: 200, body: { token, userId: user._id.toString(), status: "logged-in" } };
}