import os
import sys
from typing import NoReturn

from dotenv import load_dotenv

from pre_evaluation import Base
from pre_get_engine import get_engine


def main() -> NoReturn:
    print("PRE: Connect database and Create table")

    load_dotenv()
    db_uri = os.environ.get("PRE_DB_URI")
    if db_uri is None:
        print("Error: PRE_DB_URI is not set")
        sys.exit(1)

    # create table
    engine = get_engine(db_uri)
    Base.metadata.create_all(engine)

    # exit
    sys.exit(0)


if __name__ == "__main__":
    main()
