from typing import Annotated

from app.dependencies import get_client
from app.models import WeaviateClient
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/models", tags=["models"], dependencies=[Depends(get_client)])


@router.get("/")
async def get_all_models(client: Annotated[WeaviateClient, Depends(get_client)]):
    vectorizers = client.get_all_sentence_embedders()
    vectorizers = [v.replace("_", '-') for v in vectorizers]
    return vectorizers
