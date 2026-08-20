from fastapi import FastAPI, HTTPException

from pydantic import BaseModel

from services.trip_service import (
    calculate_daily_budget,
    get_trip_category
)

from database import init_db, SessionLocal
from models.trip import Trip


class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_style: str


# FastAPI validates the JSON body against this model
# If a field is missing or wrong type, it returns 422 automatically

app = FastAPI()

init_db()


# GET endpoint at the root path
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
    return [
        "Backpacker",
        "Standard",
        "Luxury"
    ]


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
        request.budget,
        request.days
    )

    category = get_trip_category(
        request.budget
    )

    # Create a Trip ORM object
    trip = Trip(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        category=category,
        daily_budget=daily_budget,
    )

    # Save to PostgreSQL
    db = SessionLocal()

    db.add(trip)
    db.commit()
    db.refresh(trip)

    db.close()

    return trip


# GET all trips
@app.get("/api/v1/trips")
def list_trips():

    db = SessionLocal()

    trips = db.query(Trip).all()

    db.close()

    return trips


# GET one trip by ID
@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):

    db = SessionLocal()

    trip = db.query(Trip).filter(
        Trip.id == trip_id
    ).first()

    db.close()

    # Handling not found
    if trip is None:
        raise HTTPException(
            status_code=404,
            detail=f"Trip with id {trip_id} not found"
        )

    return trip


# PUT — update trip
@app.put("/api/v1/trips/{trip_id}")
def update_trip(trip_id: int, request: TripRequest):

    db = SessionLocal()

    trip = db.query(Trip).filter(
        Trip.id == trip_id
    ).first()

    # Trip not found
    if trip is None:
        db.close()

        raise HTTPException(
            status_code=404,
            detail=f"Trip with id {trip_id} not found"
        )

    # Recalculate daily budget
    daily_budget = calculate_daily_budget(
        request.budget,
        request.days
    )

    # Recalculate category
    category = get_trip_category(
        request.budget
    )

    # Update trip data
    trip.destination = request.destination
    trip.days = request.days
    trip.budget = request.budget
    trip.category = category
    trip.daily_budget = daily_budget

    # Save changes to PostgreSQL
    db.commit()
    db.refresh(trip)

    db.close()

    return trip


# DELETE — delete trip
@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(trip_id: int):

    db = SessionLocal()

    trip = db.query(Trip).filter(
        Trip.id == trip_id
    ).first()

    # Trip not found
    if trip is None:
        db.close()

        raise HTTPException(
            status_code=404,
            detail=f"Trip with id {trip_id} not found"
        )

    # Delete trip
    db.delete(trip)
    db.commit()

    db.close()

    return {
        "message": f"Trip with id {trip_id} deleted successfully"
    }