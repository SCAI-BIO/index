import logging
import os
import tempfile
import time

import uvicorn
from datastew import DataDictionarySource
from datastew.embedding import MPNetAdapter
from datastew.process.ols import OLSTerminologyImportTask
from datastew.repository import WeaviateRepository
from datastew.repository.model import Concept, Mapping, Terminology
from datastew.visualisation import get_plot_for_current_database_state
from fastapi import FastAPI, File, HTTPException, UploadFile, Form
from starlette.background import BackgroundTasks
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import HTMLResponse, RedirectResponse

app = FastAPI(
    title="INDEX",
    description="<div id=info-text><h1>Introduction</h1>"
                "INDEX uses vector embeddings from variable descriptions to suggest mappings for datasets based on "
                "their semantic similarity. Mappings are stored with their vector representations in a knowledge "
                "base, where they can be used for subsequent harmonisation tasks, potentially improving the following "
                "suggestions with each iteration. Models for the computation as well as databases for storage are "
                "meant to be configurable and extendable to adapt the tool for specific use-cases.</div>"
                "<div id=db-plot><h1>Current DB state</h1>"
                "<p>Showing 2D Visualization of DB entries up to a limit of 1000 entries</p>"
                '<a href="/visualization">Click here to view visualization</a></div>',
    version="0.0.3",
    terms_of_service="https://www.scai.fraunhofer.de/",
    contact={
        "name": "Dr. Marc Jacobs",
        "email": "marc.jacobs@scai.fraunhofer.de",
    },
    license_info={
        "name": "Apache 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0.html",
    },
    openapi_extra={
        "info": {
            "x-logo": {
                "url": "https://example.com/logo.png",
                "altText": "Your API Logo"
            }
        }
    },
)


def connect_to_remote_weaviate_repository():
    weaviate_url = os.getenv("WEAVIATE_URL", "http://weaviate:8080")
    retries = 5
    for i in range(retries):
        try:
            return WeaviateRepository(mode="remote", path=weaviate_url)
        except Exception as e:
            logger.info(f"Attempt {i + 1} to connect to {weaviate_url} failed with error: {e}")
            time.sleep(5)
    raise ConnectionError("Could not connect to Weaviate after multiple attempts.")


logger = logging.getLogger("uvicorn.info")
repository = connect_to_remote_weaviate_repository()
db_plot_html = None

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", include_in_schema=False)
def swagger_redirect():
    return RedirectResponse(url='/docs')


@app.get("/v1", include_in_schema=False)
def swagger_redirect():
    return RedirectResponse(url='/docs')


@app.get("/version", tags=["info"])
def get_current_version():
    return app.version


@app.get("/visualization", response_class=HTMLResponse, tags=["visualization"])
def serve_visualization():
    global db_plot_html
    if not db_plot_html:
        db_plot_html = get_plot_for_current_database_state(repository)
    return db_plot_html


@app.patch("/visualization", tags=["visualization"])
def update_visualization():
    global db_plot_html
    db_plot_html = get_plot_for_current_database_state(repository)
    return {"message": "DB visualization plot has been updated successfully"}


@app.get("/terminologies", tags=["terminologies"])
async def get_all_terminologies():
    terminologies = repository.get_all_terminologies()
    return terminologies


@app.put("/terminologies/{id}", tags=["terminologies"])
async def create_terminology(id: str, name: str):
    try:
        terminology = Terminology(name=name, id=id)
        repository.store(terminology)
        return {"message": f"Terminology {id} created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create terminology: {str(e)}")


@app.get("/models", tags=["models"])
async def get_all_models():
    sentence_embedders = repository.get_all_sentence_embedders()
    return sentence_embedders


@app.get("/concepts", tags=["concepts"])
async def get_all_concepts():
    concepts = repository.get_all_concepts()
    return concepts


@app.put("/concepts/{id}", tags=["concepts"])
async def create_concept(id: str, concept_name: str, terminology_name: str):
    try:
        terminology = repository.get_terminology(terminology_name)
        concept = Concept(terminology=terminology, pref_label=concept_name, concept_identifier=id)
        repository.store(concept)
        return {"message": f"Concept {id} created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create concept: {str(e)}")


@app.get("/mappings", tags=["mappings"])
async def get_all_mappings():
    mappings = repository.get_all_mappings()
    return mappings


@app.put("/concepts/{id}/mappings", tags=["concepts", "mappings"])
async def create_concept_and_attach_mapping(id: str,
                                            concept_name: str,
                                            terminology_name,
                                            text: str,
                                            model: str = "sentence-transformers/all-mpnet-base-v2"):
    try:
        terminology = repository.get_terminology(terminology_name)
        concept = Concept(terminology=terminology, pref_label=concept_name, concept_identifier=id)
        repository.store(concept)
        embedding_model = MPNetAdapter(model)
        embedding = embedding_model.get_embedding(text)
        model_name = embedding_model.get_model_name()
        mapping = Mapping(concept=concept, text=text, embedding=embedding, sentence_embedder=model_name)
        repository.store(mapping)
        return {"message": f"Concept {id} created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create concept: {str(e)}")


@app.put("/mappings/", tags=["mappings"])
async def create_mapping(concept_id: str,
                         text: str,
                         model: str = "sentence-transformers/all-mpnet-base-v2"):
    try:
        concept = repository.get_concept(concept_id)
        embedding_model = MPNetAdapter(model)
        embedding = embedding_model.get_embedding(text)
        model_name = embedding_model.get_model_name()
        mapping = Mapping(concept=concept, text=text, embedding=embedding, sentence_embedder=model_name)
        repository.store(mapping)
        return {"message": "Mapping created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create mapping: {str(e)}")


@app.post("/mappings", tags=["mappings"])
async def get_closest_mappings_for_text(text: str,
                                        terminology_name: str = "SNOMED CT",
                                        model: str = "sentence-transformers/all-mpnet-base-v2",
                                        limit: int = 5):
    try:
        embedding_model = MPNetAdapter(model)   
        embedding = embedding_model.get_embedding(text).tolist()
        closest_mappings = repository.get_terminology_and_model_specific_closest_mappings(embedding, terminology_name, model, limit)
        mappings = []
        for mapping, similarity in closest_mappings:
            concept = mapping.concept
            terminology = concept.terminology
            mappings.append({
                "concept": {
                    "id": concept.concept_identifier,
                    "name": concept.pref_label,
                    "terminology": {
                        "id": terminology.id,
                        "name": terminology.name
                    }
                },
                "text": mapping.text,
                "similarity": similarity
            })

        return mappings
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get closest mappings: {str(e)}")


# Endpoint to get mappings for a data dictionary source
@app.post("/mappings/dict", tags=["mappings"], description="Get mappings for a data dictionary source.")
async def get_closest_mappings_for_dictionary(file: UploadFile = File(...), 
                                              model: str = Form("sentence-transformers/all-mpnet-base-v2"), 
                                              terminology_name: str = Form("SNOMED CT"),
                                              variable_field: str = Form("variable"),
                                              description_field: str = Form("description")):
    try:
        embedding_model = MPNetAdapter(model)
        # Determine file extension and create a temporary file with the correct extension
        if file.filename is not None:
            file_extension = os.path.splitext(file.filename)[1].lower()
        else:
            raise HTTPException(status_code=400, detail="Invalid file type. The file must have a suffix.")

        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp_file:
            tmp_file.write(await file.read())
            tmp_file_path = tmp_file.name

        # Initialize DataDictionarySource with the temporary file path
        data_dict_source = DataDictionarySource(file_path=tmp_file_path, variable_field=variable_field,
                                                description_field=description_field)
        df = data_dict_source.to_dataframe()

        response = []
        for _, row in df.iterrows():
            variable = row['variable']
            description = row['description']
            embedding_model = MPNetAdapter(model)
            embedding = embedding_model.get_embedding(description)
            closest_mappings = repository.get_terminology_and_model_specific_closest_mappings(
                embedding, terminology_name, model, limit=5
            )
            mappings_list = []
            for mapping, similarity in closest_mappings:
                concept = mapping.concept
                terminology = concept.terminology
                mappings_list.append({
                    "concept": {
                        "id": concept.concept_identifier,
                        "name": concept.pref_label,
                        "terminology": {
                            "id": terminology.id,
                            "name": terminology.name
                        }
                    },
                    "text": mapping.text,
                    "similarity": similarity
                })
            response.append({
                "variable": variable,
                "description": description,
                "mappings": mappings_list
            })

        # Clean up temporary file
        os.remove(tmp_file_path)

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def import_snomed_ct_task(model: str = "sentence-transformers/all-mpnet-base-v2"):
    embedding_model = MPNetAdapter(model)
    task = OLSTerminologyImportTask(repository, embedding_model, "SNOMED CT", "snomed")
    task.process()


def import_ols_terminology_task(terminology_id, model: str = "sentence-transformers/all-mpnet-base-v2"):
    embedding_model = MPNetAdapter(model)
    task = OLSTerminologyImportTask(repository, embedding_model, terminology_id, terminology_id)
    task.process()


@app.put("/import/terminology/snomed",
         description="Import whole SNOMED CT from OLS.",
         tags=["import", "tasks"])
async def import_snomed_ct(background_tasks: BackgroundTasks,
                           model: str = "sentence-transformers/all-mpnet-base-v2"):
    background_tasks.add_task(import_snomed_ct_task, model=model)
    return {"message": "SNOMED CT import started in the background"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
