import os
import json

import boto3
from dotenv import load_dotenv

load_dotenv()

AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-2")
KNOWLEDGE_BASE_ID = os.getenv("KNOWLEDGE_BASE_ID")
MODEL_ID = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")


def get_kb_client():
    return boto3.client(
        "bedrock-agent-runtime",
        region_name=AWS_REGION,
    )


def get_bedrock_client():
    return boto3.client(
        "bedrock-runtime",
        region_name=AWS_REGION,
    )


def ask_knowledge_base(question: str) -> dict:
    """
    Retrieve relevant information from the Knowledge Base,
    then use Amazon Nova to generate a grounded answer.
    """

    if not KNOWLEDGE_BASE_ID:
        raise ValueError("KNOWLEDGE_BASE_ID is not set in .env")

    # ---------------------------------------------------------
    # STEP 1: Retrieve relevant documents from Knowledge Base
    # ---------------------------------------------------------

    kb_client = get_kb_client()

    response = kb_client.retrieve(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        retrievalQuery={
            "text": question,
        },
    )

    references = []

    for result in response.get("retrievalResults", []):
        content = result.get("content", {})
        location = result.get("location", {})
        s3_location = location.get("s3Location", {})

        references.append(
            {
                "source": s3_location.get("uri"),
                "text": content.get("text"),
                "score": result.get("score"),
            }
        )

    # ---------------------------------------------------------
    # STEP 2: Build context from retrieved documents
    # ---------------------------------------------------------

    context_parts = []

    for index, reference in enumerate(references, start=1):
        context_parts.append(
            f"""
SOURCE {index}
Source: {reference["source"]}
Content:
{reference["text"]}
"""
        )

    context = "\n".join(context_parts)

    # ---------------------------------------------------------
    # STEP 3: Ask Amazon Nova using the retrieved context
    # ---------------------------------------------------------

    prompt = f"""
You are KelanaAI, a helpful and reliable travel assistant.

Answer the user's question using ONLY the information provided
in the knowledge base context below.

If the context does not contain enough information to answer
the question, clearly say that the available documents do not
provide enough information.

Do not invent facts, prices, requirements, or policies.

Keep the answer concise and easy to understand.

USER QUESTION:
{question}

KNOWLEDGE BASE CONTEXT:
{context}

IMPORTANT:
- Base your answer only on the provided context.
- Do not use outside knowledge.
- Do not mention that you are using a knowledge base.
- Do not make up missing information.
"""

    bedrock_client = get_bedrock_client()

    body = json.dumps(
        {
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "text": prompt,
                        }
                    ],
                }
            ],
        }
    )

    model_response = bedrock_client.invoke_model(
        modelId=MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=body,
    )

    response_body = json.loads(model_response["body"].read())

    try:
        answer = response_body["output"]["message"]["content"][0]["text"]
    except (KeyError, IndexError):
        answer = str(response_body)

    # ---------------------------------------------------------
    # STEP 4: Return answer + references
    # ---------------------------------------------------------

    return {
        "question": question,
        "answer": answer,
        "references": references,
    }