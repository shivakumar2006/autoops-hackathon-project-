export const config = {
    name: "auth-flow",
    description: "FLow for authentication event",

    steps: [
        "validate-signup",
        "signup-validation",
        "user-signed-up",
        "validate-login",
        "user-logged-in",
        "risk-evaluated"
    ]
};