from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import JWTError

from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
)
from services.bedrock_service import (
    get_ai_recommendation,
    get_ai_chat_response,
)
from services.kb_service import ask_knowledge_base
from services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from services.conversation_service import (
    create_conversation,
    get_user_conversations,
    get_conversation,
    get_messages,
    save_message,
)

from database import init_db, SessionLocal
from models.trip import Trip
from models.user import User
from models.conversation import Conversation
from models.message import Message


# =========================
# REQUEST MODELS
# =========================

class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_style: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AssistantRequest(BaseModel):
    question: str


class MessageRequest(BaseModel):
    content: str


# =========================
# APP
# =========================

app = FastAPI()

init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://kelana-ai-rosy.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


security = HTTPBearer()


# =========================
# DATABASE DEPENDENCY
# =========================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================
# AUTHENTICATION
# =========================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials

    try:
        user_id = decode_access_token(token)
    except (JWTError, ValueError, KeyError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    db = SessionLocal()

    try:
        user = db.query(User).filter(User.id == user_id).first()

        if user is None:
            raise HTTPException(
                status_code=401,
                detail="User not found",
            )

        return user

    finally:
        db.close()


# =========================
# GENERAL
# =========================

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


# =========================
# RAG ASSISTANT
# =========================

@app.post("/api/v1/assistant")
def assistant(request: AssistantRequest):
    try:
        result = ask_knowledge_base(request.question)

        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Knowledge Base error: {str(e)}",
        )


# =========================
# TRIP INFORMATION
# =========================

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


# =========================
# AUTH
# =========================

@app.post("/api/v1/auth/register")
def register(request: RegisterRequest):
    db = SessionLocal()

    try:
        existing_user = (
            db.query(User)
            .filter(User.email == request.email)
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered",
            )

        user = User(
            name=request.name,
            email=request.email,
            password_hash=hash_password(request.password),
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        }

    finally:
        db.close()


@app.post("/api/v1/auth/login")
def login(request: LoginRequest):
    db = SessionLocal()

    try:
        user = (
            db.query(User)
            .filter(User.email == request.email)
            .first()
        )

        if user is None or not verify_password(
            request.password,
            user.password_hash,
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
            )

        access_token = create_access_token(user.id)

        return {
            "access_token": access_token,
            "token_type": "bearer",
        }

    finally:
        db.close()


@app.get("/api/v1/auth/me")
def get_me(user: User = Depends(get_current_user)):
    db = SessionLocal()

    try:
        trip_count = (
            db.query(Trip)
            .filter(Trip.user_id == user.id)
            .count()
        )

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "total_trips": trip_count,
        }

    finally:
        db.close()


# =========================
# TRIPS
# =========================

@app.post("/api/v1/trips")
def create_trip(
    request: TripRequest,
    user: User = Depends(get_current_user),
):
    daily_budget = calculate_daily_budget(
        request.budget,
        request.days,
    )

    category = get_trip_category(
        request.budget,
    )

    ai_recommendation = get_ai_recommendation(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        travel_style=request.travel_style,
    )

    trip = Trip(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        category=category,
        daily_budget=daily_budget,
        ai_recommendation=ai_recommendation,
        user_id=user.id,
    )

    db = SessionLocal()

    try:
        db.add(trip)
        db.commit()
        db.refresh(trip)

        return trip

    finally:
        db.close()


@app.get("/api/v1/trips")
def list_trips(
    user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        trips = (
            db.query(Trip)
            .filter(Trip.user_id == user.id)
            .all()
        )

        return trips

    finally:
        db.close()


@app.get("/api/v1/trips/{trip_id}")
def get_trip(
    trip_id: int,
    user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        trip = (
            db.query(Trip)
            .filter(
                Trip.id == trip_id,
                Trip.user_id == user.id,
            )
            .first()
        )

        if trip is None:
            raise HTTPException(
                status_code=404,
                detail=f"Trip with id {trip_id} not found",
            )

        return trip

    finally:
        db.close()


@app.put("/api/v1/trips/{trip_id}")
def update_trip(
    trip_id: int,
    request: TripRequest,
    user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        trip = (
            db.query(Trip)
            .filter(Trip.id == trip_id)
            .first()
        )

        if trip is None:
            raise HTTPException(
                status_code=404,
                detail=f"Trip with id {trip_id} not found",
            )

        if trip.user_id != user.id:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to update this trip",
            )

        daily_budget = calculate_daily_budget(
            request.budget,
            request.days,
        )

        category = get_trip_category(
            request.budget,
        )

        trip.destination = request.destination
        trip.days = request.days
        trip.budget = request.budget
        trip.category = category
        trip.daily_budget = daily_budget

        db.commit()
        db.refresh(trip)

        return trip

    finally:
        db.close()


@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(
    trip_id: int,
    user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        trip = (
            db.query(Trip)
            .filter(Trip.id == trip_id)
            .first()
        )

        if trip is None:
            raise HTTPException(
                status_code=404,
                detail=f"Trip with id {trip_id} not found",
            )

        if trip.user_id != user.id:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to delete this trip",
            )

        db.delete(trip)
        db.commit()

        return {
            "message": f"Trip with id {trip_id} deleted successfully"
        }

    finally:
        db.close()


# =========================
# CONVERSATIONS
# =========================

@app.post("/api/v1/conversations", status_code=201)
def create_new_conversation(
    user: User = Depends(get_current_user),
    db = Depends(get_db),
):
    conversation = create_conversation(
        db,
        user.id,
    )

    return {
        "conversation_id": conversation.id,
        "title": conversation.title,
        "created_at": conversation.created_at,
    }


@app.get("/api/v1/conversations")
def list_conversations(
    user: User = Depends(get_current_user),
    db = Depends(get_db),
):
    conversations = get_user_conversations(
        db,
        user.id,
    )

    return [
        {
            "id": conversation.id,
            "title": conversation.title,
            "created_at": conversation.created_at,
        }
        for conversation in conversations
    ]


@app.get("/api/v1/conversations/{conversation_id}/messages")
def list_conversation_messages(
    conversation_id: int,
    user: User = Depends(get_current_user),
    db = Depends(get_db),
):
    conversation = get_conversation(
        db,
        conversation_id,
        user.id,
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    messages = get_messages(
        db,
        conversation_id,
    )

    return [
        {
            "id": message.id,
            "role": message.role,
            "content": message.content,
            "created_at": message.created_at,
        }
        for message in messages
    ]


# =========================
# SEND MESSAGE + MEMORY
# =========================

@app.post("/api/v1/conversations/{conversation_id}/messages")
def send_message(
    conversation_id: int,
    request: MessageRequest,
    user: User = Depends(get_current_user),
    db = Depends(get_db),
):
    conversation = get_conversation(
        db,
        conversation_id,
        user.id,
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    if not request.content.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty",
        )

    # 1. Save user message
    save_message(
        db,
        conversation_id,
        "user",
        request.content.strip(),
    )

    # 2. Load entire conversation history
    history = get_messages(
        db,
        conversation_id,
    )

    # 3. Build context for Bedrock
    messages = [
        {
            "role": message.role,
            "content": message.content,
        }
        for message in history
    ]

    # 4. Generate context-aware AI response
    try:
        answer = get_ai_chat_response(messages)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI response error: {str(e)}",
        )

    # 5. Save AI response
    ai_message = save_message(
        db,
        conversation_id,
        "assistant",
        answer,
    )

    # 6. Return response
    return {
        "conversation_id": conversation_id,
        "answer": answer,
        "message_id": ai_message.id,
        "created_at": ai_message.created_at,
    }