import os
import sys

import pytest

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "api"))
from app import create_app  # type: ignore


@pytest.fixture()
def app():
    app = create_app()
    yield app


@pytest.fixture()
def client(app):
    return app.test_client()
