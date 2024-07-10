import pytest
from httpx import AsyncClient

from api.routes import app


@pytest.mark.asyncio
async def test_app_starts():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/version")
        assert response.status_code == 200
