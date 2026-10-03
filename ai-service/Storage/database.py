from __future__ import annotations

import os
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator

from dotenv import load_dotenv
from sqlalchemy import create_engine, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker
from Storage.models import AdaptationGeneration, Base, UserBiography, WorkoutHistory

ROOT_ENV = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ROOT_ENV)


def get_database_url() -> str:
    database_url = os.getenv("AI_DATABASE_URL")
    if database_url:
        if database_url.startswith("postgresql://"):
            return "postgresql+psycopg://" + database_url.removeprefix("postgresql://")
        return database_url

    host = os.getenv("AI_DB_HOST", os.getenv("DB_HOST", "localhost"))
    port = os.getenv("AI_DB_PORT", os.getenv("DB_PORT", "5432"))
    user = os.getenv("AI_DB_USER", os.getenv("DB_USER", "postgres"))
    password = os.getenv("AI_DB_PASSWORD", os.getenv("DB_PASSWORD", ""))
    name = os.getenv("AI_DB_NAME", "ai-fitmaster")

    return f"postgresql+psycopg://{user}:{password}@{host}:{port}/{name}"


class AIDatabase:
    def __init__(self, database_url: str | None = None) -> None:
        self.database_url = database_url or get_database_url()
        self.engine: Engine = create_engine(
            self.database_url,
            pool_pre_ping=True,
            future=True,
        )
        self.session_factory = sessionmaker(
            bind=self.engine,
            autoflush=False,
            expire_on_commit=False,
        )

    @contextmanager
    def session(self) -> Iterator[Session]:
        session = self.session_factory()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def initialize(self) -> None:
        Base.metadata.create_all(self.engine)

    def upsert_profile(
        self,
        user_id: int,
        profile: dict[str, Any],
        indicators: dict[str, Any] | None = None,
    ) -> None:
        with self.session() as session:
            entity = session.get(UserBiography, user_id)
            if entity is None:
                session.add(
                    UserBiography(
                        user_id=user_id,
                        profile=profile,
                        indicators=indicators or {},
                    )
                )
                return

            entity.profile = profile
            if indicators is not None:
                entity.indicators = indicators

    def update_indicators(self, user_id: int, indicators: dict[str, Any]) -> None:
        with self.session() as session:
            entity = session.get(UserBiography, user_id)
            if entity is None:
                raise LookupError(f"Knowledge for user {user_id} does not exist")
            entity.indicators = indicators

    def save_workout_event(self, event: dict[str, Any]) -> None:
        with self.session() as session:
            statement = select(WorkoutHistory).where(
                WorkoutHistory.source_workout_id == event["source_workout_id"]
            )
            entity = session.scalar(statement)

            values = {
                "user_id": event["user_id"],
                "source_workout_id": event["source_workout_id"],
                "pattern_id": event["pattern_id"],
                "status": event["status"],
                "original_scheduled_at": event["original_scheduled_at"],
                "scheduled_at": event["scheduled_at"],
                "started_at": event.get("started_at"),
                "completed_at": event.get("completed_at"),
                "planned_data": event["planned_data"],
                "actual_data": event["actual_data"],
                "replacements": event.get("replacements", []),
                "exercise_catalog": event.get("exercise_catalog", []),
            }

            if entity is None:
                session.add(WorkoutHistory(**values))
                return

            for key, value in values.items():
                setattr(entity, key, value)

    def get_history(self, user_id: int) -> list[dict[str, Any]]:
        with self.session() as session:
            statement = (
                select(WorkoutHistory)
                .where(WorkoutHistory.user_id == user_id)
                .order_by(
                    WorkoutHistory.completed_at,
                    WorkoutHistory.scheduled_at,
                    WorkoutHistory.source_workout_id,
                )
            )
            rows = session.scalars(statement).all()
            return [self._history_to_dict(row) for row in rows]

    def save_generation(
        self,
        user_id: int,
        source_workout_id: int,
        model: str,
        indicators: dict[str, Any],
        generated_workout: dict[str, Any],
    ) -> int:
        with self.session() as session:
            entity = AdaptationGeneration(
                user_id=user_id,
                source_workout_id=source_workout_id,
                model=model,
                indicators=indicators,
                generated_workout=generated_workout,
            )
            session.add(entity)
            session.flush()
            return int(entity.id)

    def get_knowledge(self, user_id: int) -> dict[str, Any] | None:
        with self.session() as session:
            entity = session.get(UserBiography, user_id)
            if entity is None:
                return None

            return {
                "user_id": entity.user_id,
                "profile": entity.profile,
                "indicators": entity.indicators,
                "created_at": entity.created_at,
                "updated_at": entity.updated_at,
            }

    @staticmethod
    def _history_to_dict(entity: WorkoutHistory) -> dict[str, Any]:
        return {
            "user_id": entity.user_id,
            "source_workout_id": entity.source_workout_id,
            "pattern_id": entity.pattern_id,
            "status": entity.status,
            "original_scheduled_at": entity.original_scheduled_at,
            "scheduled_at": entity.scheduled_at,
            "started_at": entity.started_at,
            "completed_at": entity.completed_at,
            "planned_data": entity.planned_data,
            "actual_data": entity.actual_data,
            "replacements": entity.replacements,
            "exercise_catalog": entity.exercise_catalog,
            "created_at": entity.created_at,
        }
