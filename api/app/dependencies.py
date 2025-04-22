from app.models import WeaviateClient


async def get_client():
    with WeaviateClient() as client:
        yield client
