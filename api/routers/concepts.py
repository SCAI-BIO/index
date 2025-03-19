from typing import Annotated

from datastew.embedding import MPNetAdapter
from datastew.repository.model import Concept, Mapping
from fastapi import APIRouter, Depends, HTTPException

from api.dependencies import get_client
from api.models import WeaviateClient

router = APIRouter(prefix="/concepts", tags=["concepts"], dependencies=[Depends(get_client)])


@router.get("/")
async def get_all_concepts(client: Annotated[WeaviateClient, Depends(get_client)]):
    concepts = client.get_all_concepts()
    return concepts


@router.put("/{id}")
async def create_concept(
    id: str, concept_name: str, terminology_name: str, client: Annotated[WeaviateClient, Depends(get_client)]
):
    try:
        terminology = client.get_terminology(terminology_name)
        concept = Concept(terminology, concept_name, id)
        client.store(concept)
        return {"message": f"Concept {id} created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create concept: {str(e)}")


@router.put("/{id}/mappings")
async def create_concept_and_attach_mapping(
    id: str,
    concept_name: str,
    terminology_name: str,
    text: str,
    client: Annotated[WeaviateClient, Depends(get_client)],
    model: str = "sentence-transformers/all-mpnet-base-v2",
):
    try:
        terminology = client.get_terminology(terminology_name)
        concept = Concept(terminology, concept_name, id)
        client.store(concept)
        embedding_model = MPNetAdapter(model)
        embedding = embedding_model.get_embedding(text)
        model_name = embedding_model.get_model_name()
        mapping = Mapping(concept, text, list(embedding), model_name)
        client.store(mapping)
        return {"message": f"Concept {id} created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create concept: {str(e)}")
