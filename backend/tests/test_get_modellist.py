import json
import logging


def test_get_modellist(client, caplog):
    # Arrange
    caplog.clear()

    # Act
    response = client.get("/get_modellist")
    data = json.loads(response.data.decode())

    # Assert
    assert response.status_code == 200
    assert response.content_type == "application/json"
    assert "models" in data
    log_messages = [
        rec.message for rec in caplog.records if rec.levelno == logging.INFO
    ]
    assert any("GET /get_modellist received" in msg for msg in log_messages)
    assert any("GET /get_modellist return" in msg for msg in log_messages)
