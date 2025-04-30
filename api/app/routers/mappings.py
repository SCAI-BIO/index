import os
import tempfile
from typing import Annotated

from datastew import DataDictionarySource
from datastew.embedding import Vectorizer
from datastew.repository.model import Mapping
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.dependencies import get_client
from app.models import OLLAMA_URL, WeaviateClient

router = APIRouter(prefix="/mappings", tags=["mappings"], dependencies=[Depends(get_client)])


@router.get("/")
async def get_all_mappings(
    client: Annotated[WeaviateClient, Depends(get_client)],
    model: str = "nomic-embed-text",
    limit: int = 10,
    offset: int = 0,
):
    if client.use_weaviate_vectorizer:
        model = model.replace("-", "_").replace("/", "_")
    mappings = client.get_mappings(sentence_embedder=model, limit=limit, offset=offset)
    return mappings.items


@router.put("/")
async def create_mapping(
    concept_id: str,
    text: str,
    client: Annotated[WeaviateClient, Depends(get_client)],
    model: str = "nomic-embed-text",
):
    try:
        concept = client.get_concept(concept_id)
        if client.use_weaviate_vectorizer:
            mapping = Mapping(concept, text)
        else:
            embedding_model = Vectorizer(model, host=OLLAMA_URL)
            embedding = embedding_model.get_embedding(text)
            model_name = embedding_model.model_name
            mapping = Mapping(concept, text, list(embedding), model_name)
        client.store(mapping)
        return {"message": "Mapping created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create mapping: {str(e)}")


@router.post("/")
async def get_closest_mappings_for_text(
    client: Annotated[WeaviateClient, Depends(get_client)],
    text: str = Form(...),
    terminology_name: str = Form("OHDSI"),
    model: str = Form("nomic-embed-text"),
    limit: int = Form(5),
):
    try:
        embedding_model = Vectorizer(model, host=OLLAMA_URL)
        embedding = embedding_model.get_embedding(text)
        if client.use_weaviate_vectorizer:
            model = model.replace("-", "_").replace("/", "_")
        closest_mappings = client.get_closest_mappings(embedding, True, terminology_name, model, limit)
        mappings = []
        for mapping_result in closest_mappings:
            concept = mapping_result.mapping.concept
            terminology = concept.terminology
            mappings.append(
                {
                    "concept": {
                        "id": concept.concept_identifier,
                        "name": concept.pref_label,
                        "terminology": {"id": terminology.id, "name": terminology.name},
                    },
                    "text": mapping_result.mapping.text,
                    "similarity": mapping_result.similarity,
                }
            )

        return mappings
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get closest mappings: {str(e)}")


@router.get("/total-number")
async def get_total_number_of_mappings(client: Annotated[WeaviateClient, Depends(get_client)]):
    mapping = client.client.collections.get("Mapping")
    return mapping.aggregate.over_all(total_count=True).total_count


# Endpoint to get mappings for a data dictionary source
@router.post("/dict", description="Get mappings for a data dictionary source.")
async def get_closest_mappings_for_dictionary(
    client: Annotated[WeaviateClient, Depends(get_client)],
    file: UploadFile = File(...),
    model: str = Form("sentence-transformers/all-mpnet-base-v2"),
    terminology_name: str = Form("SNOMED CT"),
    variable_field: str = Form("variable"),
    description_field: str = Form("description"),
    limit: int = Form(5),
):
    try:
        embedding_model = Vectorizer(model, host=OLLAMA_URL)
        if client.use_weaviate_vectorizer:
            model = model.replace("-", "_").replace("/", "_")
        if not file or not file.filename:
            raise HTTPException(status_code=400, detail="No file was provided. Please upload a valid file.")

        # Check for a valid file extension
        file_extension = os.path.splitext(file.filename)[1].lower()
        if not file_extension:
            raise HTTPException(status_code=400, detail="The uploaded file must have a valid extension.")

        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp_file:
            tmp_file.write(await file.read())
            tmp_file_path = tmp_file.name

        # Initialize DataDictionarySource
        data_dict_source = DataDictionarySource(tmp_file_path, variable_field, description_field)
        df = data_dict_source.to_dataframe()

        # Collect descriptions and their corresponding variables
        descriptions = df["description"].to_list()
        variables = df["variable"].to_list()

        # Generate embeddings for all descriptions in batches
        embeddings = embedding_model.get_embeddings(descriptions)

        # Process embeddings to get closest mappings
        response = []
        for variable, description, embedding in zip(variables, descriptions, embeddings):
            closest_mappings = client.get_closest_mappings(embedding, True, terminology_name, model, limit)
            mappings_list = [
                {
                    "concept": {
                        "id": mapping_result.mapping.concept.concept_identifier,
                        "name": mapping_result.mapping.concept.pref_label,
                        "terminology": {
                            "id": mapping_result.mapping.concept.terminology.id,
                            "name": mapping_result.mapping.concept.terminology.name,
                        },
                    },
                    "text": mapping_result.mapping.text,
                    "similarity": mapping_result.similarity,
                }
                for mapping_result in closest_mappings
            ]

            response.append({"variable": variable, "description": description, "mappings": mappings_list})

        # Clean up temporary file
        os.remove(tmp_file_path)

        return response
    except ValueError:
        raise HTTPException(status_code=422, detail="Missing required column(s): 'description' and/or 'variable'.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
