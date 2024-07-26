from sqlalchemy.orm import (  # type: ignore[attr-defined]
    DeclarativeBase,
    Mapped,
    mapped_column,
)
from sqlalchemy.types import Float, Integer, String


class Base(DeclarativeBase):
    pass


class Evaluation(Base):
    def __init__(
        self,
        qa_id: str,
        lines: int,
        prompt_class: str,
        temperature: float,
        completion_tokens: int,
        prompt_tokens: int,
        rating: float,
        comment: str,
        deployment_name: str,
        model: str,
    ):
        self.qa_id = qa_id
        self.lines = lines
        self.prompt_class = prompt_class
        self.temperature = temperature
        self.completion_tokens = completion_tokens
        self.prompt_tokens = prompt_tokens
        self.rating = rating
        self.comment = comment
        self.deployment_name = deployment_name
        self.model = model

    __tablename__ = "evaluation"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    qa_id: Mapped[str] = mapped_column(String)
    lines: Mapped[int] = mapped_column(Integer)
    prompt_class: Mapped[str] = mapped_column(String)
    temperature: Mapped[float] = mapped_column(Float)
    completion_tokens: Mapped[int] = mapped_column(Integer)
    prompt_tokens: Mapped[int] = mapped_column(Integer)
    rating: Mapped[float] = mapped_column(Float)
    comment: Mapped[str] = mapped_column(String)
    deployment_name: Mapped[str] = mapped_column(String)
    model: Mapped[str] = mapped_column(String)
