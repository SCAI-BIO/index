from typing import Annotated

from datastew.repository import WeaviateRepository
from fastapi import APIRouter, Depends

from api.dependencies import get_client

router = APIRouter(prefix="/models", tags=["models"], dependencies=[Depends(get_client)])


@router.get("/")
async def get_all_models(client: Annotated[WeaviateRepository, Depends(get_client)]):
    vectorizers = client.get_all_sentence_embedders()
    return vectorizers
