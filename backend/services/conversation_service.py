from sqlalchemy.orm import Session

from models.conversation import Conversation
from models.message import Message


def create_conversation(
    db: Session,
    user_id: int
):
    conversation = Conversation(
        user_id=user_id,
        title="New Conversation"
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


def get_user_conversations(
    db: Session,
    user_id: int
):
    return (
        db.query(Conversation)
        .filter(
            Conversation.user_id == user_id
        )
        .order_by(
            Conversation.created_at.desc()
        )
        .all()
    )


def get_conversation(
    db: Session,
    conversation_id: int,
    user_id: int
):
    return (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        )
        .first()
    )


def get_messages(
    db: Session,
    conversation_id: int
):
    return (
        db.query(Message)
        .filter(
            Message.conversation_id == conversation_id
        )
        .order_by(
            Message.created_at.asc()
        )
        .all()
    )


def save_message(
    db: Session,
    conversation_id: int,
    role: str,
    content: str
):
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message