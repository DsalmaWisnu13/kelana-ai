import os
import json
import boto3
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

AWS_BEARER_TOKEN = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
MODEL_ID = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")


def get_bedrock_client() -> boto3.client:
    """
    Create and return a boto3 Bedrock Runtime client authenticated via
    the bearer token stored in AWS_BEARER_TOKEN_BEDROCK.
    """
    if not AWS_BEARER_TOKEN:
        raise ValueError(
            "AWS_BEARER_TOKEN_BEDROCK is not set. "
            "Please add it to your .env file."
        )

    session = boto3.Session()

    client = session.client(
        service_name="bedrock-runtime",
        region_name=AWS_REGION,
    )

    # Attach the bearer token to every outgoing request.
    def _inject_bearer_token(request, **kwargs):
        request.headers["Authorization"] = f"Bearer {AWS_BEARER_TOKEN}"

    client.meta.events.register(
        "before-send.bedrock-runtime.*",
        _inject_bearer_token
    )

    return client


# ---------------------------------------------------------------------------
# AI recommendation
# ---------------------------------------------------------------------------

def get_ai_recommendation(
    destination: str,
    days: int,
    budget: float,
    travel_style: str,
) -> str:
    """
    Call Amazon Bedrock and return an AI-generated travel itinerary.
    """

    prompt = f"""
    You are an experienced and friendly travel planner.

    Create a practical {days}-day travel itinerary for the traveler.

    TRIP DETAILS:
    - Destination: {destination}
    - Total Budget: USD {budget}
    - Number of Days: {days}
    - Travel Style: {travel_style}

    IMPORTANT RULES:
    1. The budget provided is the TOTAL trip budget, not the daily budget.
    2. Keep recommendations realistic for the travel style and destination.
    3. Calculate the estimated daily budget as total budget divided by number of days.
    4. Do not invent exact prices when you are uncertain. Use "Varies" or an approximate range.
    5. Keep each activity description concise: 1-2 sentences.
    6. Prioritize practical and geographically reasonable activities.
    7. Do not repeat the same attraction unnecessarily.
    8. Use simple Markdown only.
    9. Do not add a long introduction or conclusion.

    FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

    # {days}-Day {travel_style} Travel Plan in {destination}

    ## Estimated Daily Budget

    USD {budget / days:.2f}

    ## Day 1

    ### Morning Activities

    #### Activity 1: [Activity Name]
    - Cost: [Estimated cost]
    - Description: [Short description]

    #### Activity 2: [Activity Name]
    - Cost: [Estimated cost]
    - Description: [Short description]

    ### Afternoon Activities

    #### Activity 1: [Activity Name]
    - Cost: [Estimated cost]
    - Description: [Short description]

    #### Activity 2: [Activity Name]
    - Cost: [Estimated cost]
    - Description: [Short description]

    ### Evening Activities

    #### Activity 1: [Activity Name]
    - Cost: [Estimated cost]
    - Description: [Short description]

    #### Activity 2: [Activity Name]
    - Cost: [Estimated cost]
    - Description: [Short description]

    Repeat the same Day structure for all remaining days.

    After all days, provide:

    ## Transportation Suggestions

    - [Transportation option]&#58; [Short explanation]

    ## Local Food Recommendations

    - [Food]&#58; [Short explanation]
    - [Food]&#58; [Short explanation]
    - [Food]&#58; [Short explanation]

    IMPORTANT:
    - Keep the exact heading structure above.
    - Use "## Day X" for each day.
    - Use "### Morning Activities", "### Afternoon Activities", and "### Evening Activities".
    - Use "#### Activity X: Activity Name" for activities.
    - Do not use tables.
    - Do not use HTML.
    - Do not wrap the response in a code block.
    """

    client = get_bedrock_client()

    body = json.dumps(
        {
            "messages": [
                {
                    "role": "user",
                    "content": [{"text": prompt}],
                }
            ],
        }
    )

    response = client.invoke_model(
        modelId=MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=body,
    )

    response_body = json.loads(response["body"].read())

    try:
        return response_body["output"]["message"]["content"][0]["text"]
    except (KeyError, IndexError):
        return str(response_body)


# ---------------------------------------------------------------------------
# AI conversational chat
# ---------------------------------------------------------------------------

def get_ai_chat_response(messages: list[dict[str, str]]) -> str:
    """
    Call Amazon Bedrock with conversation history and return
    an AI-generated conversational response.
    """

    system_prompt = """
    You are KelanaAI, a friendly and helpful AI travel assistant.

    Your job is to help users with:
    - travel planning
    - destinations
    - transportation
    - activities
    - local food
    - travel budgets
    - travel-related questions

    IMPORTANT RULES:
    1. Use the previous conversation messages to understand context.
    2. If the user asks a follow-up question, connect it to the previous messages.
    3. Do not ask the user to repeat information that is already available
       in the conversation history.
    4. Give practical and concise answers.
    5. If information is uncertain, say so instead of inventing facts.
    6. Answer naturally and conversationally.
    """

    client = get_bedrock_client()

    formatted_messages = []

    for message in messages:
        role = message["role"]

        if role not in ["user", "assistant"]:
            continue

        formatted_messages.append(
            {
                "role": role,
                "content": [
                    {
                        "text": message["content"]
                    }
                ],
            }
        )

    if formatted_messages:
        formatted_messages.insert(
            0,
            {
                "role": "user",
                "content": [
                    {
                        "text": system_prompt
                    }
                ],
            },
        )

    body = json.dumps(
        {
            "messages": formatted_messages,
        }
    )

    response = client.invoke_model(
        modelId=MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=body,
    )

    response_body = json.loads(response["body"].read())

    try:
        return response_body["output"]["message"]["content"][0]["text"]
    except (KeyError, IndexError):
        return str(response_body)