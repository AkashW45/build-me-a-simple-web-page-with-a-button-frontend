import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_root_returns_index_html(client):
    rv = client.get('/')
    assert rv.status_code == 200
    assert rv.content_type == 'text/html; charset=utf-8'
    assert len(rv.data) > 0

def test_index_html_still_works(client):
    rv = client.get('/index.html')
    assert rv.status_code == 200
    assert rv.content_type == 'text/html; charset=utf-8'
    assert len(rv.data) > 0

def test_health_returns_status_ok(client):
    rv = client.get('/health')
    assert rv.status_code == 200
    assert rv.content_type == 'application/json'
    json_data = rv.get_json()
    assert json_data == {"status": "ok"}

def test_download_returns_file_with_correct_length(client):
    rv = client.get('/download')
    assert rv.status_code == 200
    assert rv.content_type == 'text/plain; charset=utf-8'
    assert 'attachment; filename=random.txt' in rv.headers.get('Content-Disposition', '')
    assert len(rv.data) == 10240

def test_404_for_nonexistent_route(client):
    rv = client.get('/nonexistent')
    assert rv.status_code == 404