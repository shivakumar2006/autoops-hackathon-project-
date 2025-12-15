import bcrypt from "bcrypt";
import { z } from "zod";
import connectMongo from "../utils/mongo";
import { UserModel } from "../models/user";
import { signToken } from "../utils/jwt";

const SignupBody = z.object({
    email: z.string().email(),
    name: z.string().min(1),
    password: z.string().min(6),
});

export const config = {
    name: "SignupApi",
    type: "api",
    path: "/auth/signup",
    method: "POST",
    description: "Create user, emit validation & signup events, return jwt",
    emits: ["validate-signup", "user-signed-up"],
    flows: ["auth-flow"]
};

export const handler = async (req: any, { emit, logger }: any) => {
    const parsed = SignupBody.safeParse(req.body);
    if (!parsed.success) {
        logger.warn("Invalid signup payload", { errors: parsed.error.format() });
        return { status: 400, body: { error: "invalid payload" } };
    }
    const { email, name, password } = parsed.data;

    await connectMongo();

    // check existing 
    const existing = await UserModel.findOne({ email }).lean();
    if (existing) {
        return { status: 409, body: { message: "user already exist" } };
    }

    // hash password 
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await UserModel.create({
        email,
        name,
        passwordHash,
        roles: ["User"],
        status: "active",
    });

    logger.info("User created", { userId: user._id.toString(), email });

    await emit({
        topic: "validate-signup",
        data: {
            userId: user._id.toString(),
            email: user.email,
            name: user.name,
            createdAt: user.createdAt.toISOString(),
        },
    });

    const token = signToken({
        sub: user._id.toString(),
        email: user.email,
        roles: user.roles,
    });

    return { status: 201, body: { token, userId: user._id.toString(), status: "created" } };
} 