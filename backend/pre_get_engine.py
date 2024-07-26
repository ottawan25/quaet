from sqlalchemy import Engine, create_engine  # type: ignore[attr-defined]


def get_engine(db_uri: str) -> Engine:
    return create_engine(db_uri, echo=True)
