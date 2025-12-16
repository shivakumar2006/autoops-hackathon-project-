export const config = {
    name: "subscription-renewal-flow",
    description: "Subscription renewal flow",
    steps: [
        "subscription-renewal-job",
        "subscription-validate",
        "subscription-risk-check",
        "subscription-create-payment",
        "subscription-payment-retry",
        "subscription-invoice-generate",
        "subscription-email-send",
        "subscription-renewal-finalize"
    ]
}