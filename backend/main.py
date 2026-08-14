from fastapi import FastAPI
from pydantic import BaseModel
from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_transportation
)


class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_style: str


# FastAPI validates the JSON body against this model
# If a field is missing or wrong type, it returns 422 automatically

app = FastAPI()


# a GET endpoint at the root path
@app.get("/")
def home():
    return {
        "message": "Welcome to KelanaAI"
    }

@app.get("/health")
def health():
    return {
        "status": "Ok"
    }

@app.get("/api/v1/trip-categories")
def categories():
    return {
        "Backpacker",
        "Standard",
        "Luxury"
    }

@app.get("/api/v1/recommendations")
def get_recommendations():
    return [
        "Tokyo Tower",
        "Mount Fuji",
        "Shibuya"
    ]

@app.get("/api/v1/transportations")
def get_transportations():
    return [
        "Bus",
        "Train",
        "Flight"
    ]

# POST endpoint — receives JSON, returns JSON
@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
    daily_budget = calculate_daily_budget(
        request.budget, request.days
    )

    category = get_trip_category(
        request.budget
    )

    transportation = get_transportation(category)

    return {
        "destination": request.destination,
        "budget": request.budget,
        "daily_budget": daily_budget,
        "category": category,
        "recommendation_transport": transportation,
    }