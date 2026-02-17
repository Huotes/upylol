"""Player cache model for persisting profile lookups."""

from datetime import datetime

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PlayerCache(Base):
    """Cached player profile data."""

    __tablename__ = "player_cache"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    puuid: Mapped[str] = mapped_column(
        String(78), unique=True, index=True, nullable=False,
    )
    game_name: Mapped[str] = mapped_column(String(64), nullable=False)
    tag_line: Mapped[str] = mapped_column(String(8), nullable=False)
    platform: Mapped[str] = mapped_column(String(8), nullable=False)
    tier: Mapped[str] = mapped_column(String(16), default="UNRANKED")
    summoner_level: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(),
    )
