from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import BigInteger, DateTime, Index, Integer, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.types import JSON


class Base(DeclarativeBase):
    pass


class UserBiography(Base):
    __tablename__ = "user_biography"

    user_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    profile: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    indicators: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )


class WorkoutHistory(Base):
    __tablename__ = "workout_history"
    __table_args__ = (Index("idx_ai_workout_history_user_completed", "user_id", "completed_at"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    source_workout_id: Mapped[int] = mapped_column(BigInteger, nullable=False, unique=True)
    pattern_id: Mapped[str] = mapped_column(String(36), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    original_scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    planned_data: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    actual_data: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    replacements: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)
    exercise_catalog: Mapped[list[dict[str, Any]]] = mapped_column(
        JSON, nullable=False, default=list
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class AdaptationGeneration(Base):
    __tablename__ = "adaptation_generation"
    __table_args__ = (Index("idx_adaptation_generation_user", "user_id", "created_at"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    source_workout_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    model: Mapped[str] = mapped_column(String(255), nullable=False)
    indicators: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    generated_workout: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
