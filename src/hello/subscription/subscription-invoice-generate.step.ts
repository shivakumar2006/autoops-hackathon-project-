export const config = {
    name: "SubscriptionInvoiceGenerate",
    type: "event",
    subscribes: ["subscription-invoice-generate"],
    description: "generate invoice for subscription renewal",
    emits: ["subscription-email-send"],
    flows: ["subscription-renewal-flow"]
};

export const handler = async (input, { emit, logger }) => {
    const invoiceId = `inv_${Date.now()}`;

    logger.info("Invoice generated", { invoiceId });

    await emit({
        topic: "subscription-email-send",
        data: { ...input, invoiceId }
    })
}