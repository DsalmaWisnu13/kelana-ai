from sqlalchemy import Column, BigInteger, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    title = Column(String(256), nullable=False, default="New Conversation")
    created_at = Column(DateTime(timezone=True), server_default=func.now())