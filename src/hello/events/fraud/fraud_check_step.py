import os 
from datetime import datetime, timezone
import random 
from pymongo import MongoClient

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://host.docker.internal:27017")
DB_NAME = os.environ.get("MONGO_DB", "autoops")

config = {
    "name": "FraudCheckPython",
    "type": "event",
    "description": "Universal fraud risk engine (python)",
    "subscribes": [
    "user-signed-up",
    "user-logged-in",
    "onboarding-risk-result",
    # "payment-confirmed",
    #"onboarding-risk-result"
    ],
    "emits": ["risk-evaluated"],
    "flows": ["auth-flow", "onboarding-flow"],
    "input": {
        "type": "object",
         "properties": {},             
        "additionalProperties": True 
    }
}

_client = None

def get_db():
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URI)
    return _client[DB_NAME]

async def handler(input_data, context):

    db = get_db()
    topic = None 

    if "paymentId" in input_data or "amount" in input_data:
        topic = "payment-initiated"
    elif input_data.get("stage") == "onboarding" or input_data.get("onboarding") is True:
        topic = "onboarding"
    elif "userId" in input_data or "email" in input_data: 
        topic = "user-signed-up" if input_data.get("createdAt") else "user-logged-in"
    else: 
        topic = "generic"

    #basic hueristic scoring 
    # for payment: hogher amount -> higher baseline risk 

    score = 0.05 
    label = "low"
    reason = "default"

    if topic == "payment-initiated":
        amount = float(input_data.get("amount", 0))
        if amount > 10000:
            score = round(random.uniform(0.6, 0.95), 2)
            label = "high"
            reason = "high_amount"
        elif amount > 1000:
            score = round(random.uniform(0.2, 0.6), 2)
            label = "mid"
            reason = "mid_amount"
        else: 
            score = round(random.uniform(0.01, 0.25), 2)
            label = "low"
            reason = "low_amount"
    elif topic in ("user-signed-up", "user-logged-in"):
        email = input_data.get("email", "")
        domain = email.split("@")[-1].lower() if "@" in email else ""
        suspicious = ["fraudemail.dev", "suspicious.test"]
        if domain in suspicious: 
            score = 0.98
            label = "high"
            reason = "suspicious_domain"
        else: 
            score = round(random.uniform(0.01, 0.35), 2)
            label = "low"
            reason = "normal_behavior"
    # NEW: ONBOARDING FRAUD RISK
    elif topic == "onboarding":
        email = input_data.get("email", "")
        risky_domains = ["tempmail.com", "mailinator.com", "disposable.xyz"]

        if email.split("@")[-1].lower() in risky_domains:
            score = round(random.uniform(0.7, 0.95), 2)
            label = "high"
            reason = "suspicious_onboarding_email"
        else:
            score = round(random.uniform(0.01, 0.20), 2)
            label = "low"
            reason = "normal_onboarding"
    else:
        score = round(random.uniform(0.01, 0.05), 2)
        label = "low"

    now = datetime.now(timezone.utc).isoformat()

    risk_doc = {
        "topic": topic,
        "source": input_data,
        "score": float(score),
        "label": label,
        "reason": reason,
        "modelversion": "v0.1-motia-demo",
        "evaluatedAt": now 
    }

    # store risk_doc 
    user_id = input_data.get("userId") or input_data.get("user_id") or input_data.get("userID")
    if user_id: 
        risk_doc["userId"] = user_id 
        context.logger.info("fraud_check: storing risk record for user", {"userId": user_id, "score": score})
    else: 
        context.logger.info("fraud_check: storing risk record (no user)", {"score": score})

    # isert into collections 
    db.risk_scores.insert_one(risk_doc)

    # if user exist update user's riskSumary 
    if user_id: 
        db.users.update_one(
            {"_id": user_id},
            {"$set": {"riskSummary": {"latestScore": float(score), "latestLabel": label, "evaluatedAt": now}}},
            upsert=False
        )

    context.emit({
        "topic": "risk-evaluated",
        "data": {
            "userId": user_id,
            "score": float(score),
            "label": label,
            "evaluatedAt": now,
            "modelVersion": "v0.1-motia-demo",
            "sourceTopic": topic
        }
    })

    context.logger.info("fraud_check: emitted risk evaluated", {"userId": user_id, "label": label})