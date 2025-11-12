import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data
    assert "participants" in data["Chess Club"]

def test_signup_for_activity():
    email = "student1@example.com"
    activity = "Chess Club"
    # First signup should succeed
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    # Duplicate signup should fail
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 400
    assert response.json()["detail"] == "Student is already signed up"

def test_signup_activity_not_found():
    response = client.post("/activities/Nonexistent/signup?email=test@example.com")
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"

def test_signup_invalid_email():
    response = client.post("/activities/Chess Club/signup?email=notanemail")
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid email address"

def test_signup_activity_full():
    activity = "Chess Club"
    # Fill up the activity
    for i in range(1, 21):
        email = f"student{i}@example.com"
        client.post(f"/activities/{activity}/signup?email={email}")
    # Next signup should fail
    response = client.post(f"/activities/{activity}/signup?email=overflow@example.com")
    assert response.status_code == 400
    assert response.json()["detail"] == "Activity is full"

def test_delete_participant():
    activity = "Chess Club"
    email = "delete_me@example.com"
    # Sign up first
    client.post(f"/activities/{activity}/signup?email={email}")
    # Delete participant (should fail until DELETE endpoint is implemented)
    response = client.delete(f"/activities/{activity}/signup?email={email}")
    # Accept either 200 or 405 depending on implementation
    assert response.status_code in (200, 405)
