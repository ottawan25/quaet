import json
import logging
import os


def load_json_file(file_path):
    with open(file_path, "r") as file:
        data = json.load(file)
    return data


def test_multiturn_completion(client, caplog):
    # Arrange
    caplog.clear()
    json_file_path = os.path.join(
        os.path.dirname(__file__), "data", "req_post_multiturn_completion.json"
    )
    json_data = load_json_file(json_file_path)

    # Act
    response = client.post("/multiturn_completion", json=json_data)
    data = json.loads(response.data.decode())

    # Assert
    assert response.status_code == 200
    assert response.content_type == "application/json"
    assert "assistant_content" in data
    log_messages = [
        rec.message for rec in caplog.records if rec.levelno == logging.INFO
    ]
    assert any("POST /multiturn_completion received" in msg for msg in log_messages)
    assert any("POST /multiturn_completion return" in msg for msg in log_messages)
