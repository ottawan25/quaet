import json
import os
import subprocess


def load_json_file(file_path):
    with open(file_path, "r") as file:
        data = json.load(file)
    return data


def test_add_evaluation(client, caplog):
    # Arrange
    caplog.clear()
    json_file_path = os.path.join(
        os.path.dirname(__file__), "data", "req_post_add_evaluation.json"
    )
    json_data = load_json_file(json_file_path)
    db_uri = os.environ.get("PRE_DB_URI")
    print(db_uri)
    loc1 = db_uri.rfind("/")
    print(f"loc1: {loc1}")
    uri_head = db_uri[0:loc1]
    print(f"uri_head: {uri_head}")
    tdb = uri_head + "/" + "test.db"
    loc2 = db_uri.find("///")
    print(f"loc2: {loc2}")
    print(f"tdb: {tdb}")
    dbdir = db_uri[loc2 + 3 : loc1]
    dbname_bk = "./" + dbdir + "/test.db.bk"
    dbname = "./" + dbdir + "/test.db"
    print(dbname_bk)
    print(dbname)
    os.environ["PRE_DB_URI"] = tdb
    subprocess.run(["python", "api/pre_setup.py"])

    # Act
    response = client.post("/add_evaluation", json=json_data)

    # Assert
    assert response.status_code == 201
    subprocess.run(["mv", dbname, dbname_bk])
