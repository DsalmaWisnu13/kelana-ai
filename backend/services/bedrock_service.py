import os
import json
import boto3
from botocore.auth import SigV4Auth
from botocore.awsrequest import AWSRequest
from botocore.credentials import Credentials
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

    The token is a base-64 encoded string that encodes temporary
    Bedrock API key credentials. boto3 accepts it through a custom
    HTTP session using botocore's token provider mechanism.
    """
    if not AWS_BEARER_TOKEN:
        raise ValueError(
            "AWS_BEARER_TOKEN_BEDROCK is not set. "
            "Please add it to your .env file."
        )

    # Build the client with the bearer token injected as an HTTP header via
    # a custom event handler so it is sent on every request.
    session = boto3.Session()
    client = session.client(
        service_name="bedrock-runtime",
        region_name=AWS_REGION,
    )

    # Attach the bearer token to every outgoing request.
    def _inject_bearer_token(request, **kwargs):  # noqa: ANN001
        request.headers["Authorization"] = f"Bearer {AWS_BEARER_TOKEN}"

    client.meta.events.register("before-send.bedrock-runtime.*", _inject_bearer_token)

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

    Parameters
    ----------
    destination : str
        The travel destination (e.g. "Bali, Indonesia").
    days : int
        Number of days for the trip.
    budget : float
        Total budget in USD.
    travel_style : str
        Travel style description (e.g. "adventure", "luxury", "backpacker").

    Returns
    -------
    str
        The model's itinerary text.
    """
    prompt = (f"""
        You are an experienced travel planner.

        Create a detailed {days}-day travel plan.

        Trip Details:
        - Destination: {destination}
        - Budget: USD {budget}
        - Number of Days: {days}
        - Travel Style: {travel_style}

        For each day, divide the itinerary into three sections:

        ### Morning Activities
        - Provide 2-3 activities for the morning.

        ### Afternoon Activities
        - Include cultural sites, local experiences, or other activities.

        ### Evening Activities
        - Suggest evening spots, dinner, entertainment, or nightlife.

        Also include:
        - Estimated daily budget
        - Local food recommendations
        - Transportation suggestions

        Please format your response using Markdown with clear headings and bullet points.
        """
    )

    client = get_bedrock_client()

    # Amazon Nova / Titan converse-compatible payload
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

    # Nova models return output under output.message.content[0].text
    try:
        return response_body["output"]["message"]["content"][0]["text"]
    except (KeyError, IndexError):
        # Fallback for other model response shapes
        return str(response_body)
