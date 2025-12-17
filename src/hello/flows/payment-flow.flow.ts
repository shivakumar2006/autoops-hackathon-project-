export const config = {
    name: "payment-flow",
    description: "Payment processing workflow",
    steps: [
        "PaymentReconciliationJob",
        "DeadLetterRetryJob",
        "payment-start",
        "payment-validate",
        "payment-created",
        "payment-risk-scanned",
        // "FraudCheckPython",
        "payment-fraud-check",
        "risk-evaluated",
        "payment-confirmed",
        "payment-invoice-generated",
        "payment-receipt-sent",
        "payment-completed"
    ]
}