from app.models import WeaviateClient


async def get_client():
    with WeaviateClient() as client:
        yield client


def get_client_instance() -> WeaviateClient:
    return WeaviateClient()
