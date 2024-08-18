import json
import logging
import os


def load_json_file(file_path):
    with open(file_path, "r") as file:
        data = json.load(file)
    return data


def test_count_tokens(client, caplog):
    # Arrange
    caplog.clear()
    json_file_path = os.path.join(
        os.path.dirname(__file__), "data", "req_post_count_tokens.json"
    )
    json_data = load_json_file(json_file_path)

    # Act
    response = client.post("/count_tokens", json=json_data)
    data = json.loads(response.data.decode())

    # Assert
    assert response.status_code == 200
    assert response.content_type == "application/json"
    assert "total_tokens" in data
    log_messages = [
        rec.message for rec in caplog.records if rec.levelno == logging.INFO
    ]
    assert any("POST /count_tokens received" in msg for msg in log_messages)
    assert any("POST /count_tokens return" in msg for msg in log_messages)
