from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker


def get_session(db_uri: str) -> Session:
    engine = create_engine(db_uri)

    Session = sessionmaker(bind=engine)

    session = Session()

    return session
