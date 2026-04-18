"""
models.py – SQLAlchemy ORM model for persisting API request logs.
Each row represents one intercepted call to the OpenAI-compatible gateway.
"""

from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, Integer, String

from database import Base


class RequestLog(Base):
    """
    Tracks every proxied LLM request with token usage, latency, and cost.
    """

    __tablename__ = "request_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )
    model_name = Column(String(100), nullable=False, index=True)
    prompt_tokens = Column(Integer, nullable=False, default=0)
    completion_tokens = Column(Integer, nullable=False, default=0)
    total_tokens = Column(Integer, nullable=False, default=0)
    total_latency_ms = Column(Float, nullable=False, default=0.0)
    estimated_cost_usd = Column(Float, nullable=False, default=0.0)

    def __repr__(self) -> str:
        return (
            f"<RequestLog id={self.id} model={self.model_name!r} "
            f"tokens={self.total_tokens} latency={self.total_latency_ms:.1f}ms "
            f"cost=${self.estimated_cost_usd:.6f}>"
        )
