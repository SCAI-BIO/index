from typing import Annotated

from fastapi import APIRouter, Depends

from api.dependencies import get_client
from api.models import WeaviateClient

router = APIRouter(prefix="/models", tags=["models"], dependencies=[Depends(get_client)])


@router.get("/")
async def get_all_models(client: Annotated[WeaviateClient, Depends(get_client)]):
    vectorizers = client.get_all_sentence_embedders()
    vectorizers = [v.replace("_", '-') for v in vectorizers]
    return vectorizers
