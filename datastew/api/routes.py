import logging
import os
import tempfile

import uvicorn
from fastapi import FastAPI, HTTPException, File, UploadFile
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse, HTMLResponse

from datastew import DataDictionarySource
from datastew.repository.model import Terminology, Concept, Mapping
from datastew.embedding import MPNetAdapter
from datastew.repository.sqllite import SQLLiteRepository
from datastew.visualisation import get_html_plot_for_current_database_state

logger = logging.getLogger("uvicorn.info")
repository = SQLLiteRepository(path="datastew/db/index.db")
embedding_model = MPNetAdapter()
db_plot_html = None

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


@app.get("/version", tags=["info"])
def get_current_version():
    return app.version


@app.get("/visualization", response_class=HTMLResponse, tags=["visualization"])
def serve_visualization():
    global db_plot_html
    if not db_plot_html:
        db_plot_html = get_html_plot_for_current_database_state(repository)
    return db_plot_html


@app.patch("/visualization", tags=["visualization"])
def update_visualization():
    global db_plot_html
    db_plot_html = get_html_plot_for_current_database_state(repository)
    return {"message": "DB visualization plot has been updated successfully"}


@app.get("/terminologies", tags=["terminologies"])
async def get_all_terminologies():
    terminologies = repository.get_all_terminologies()
    return terminologies


@app.put("/terminologies/{id}", tags=["terminologies"])
async def create_or_update_terminology(id: str, name: str):
    try:
        terminology = Terminology(name=name, id=id)
        repository.store(terminology)
        return {"message": f"Terminology {id} created or updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create or update terminology: {str(e)}")


@app.get("/concepts", tags=["concepts"])
async def get_all_concepts():
    concepts = repository.get_all_concepts()
    return concepts


@app.put("/concepts/{id}", tags=["concepts"])
async def create_or_update_concept(id: str, terminology_id: str, name: str):
    try:
        terminology = repository.session.query(Terminology).filter(Terminology.id == terminology_id).first()
        if not terminology:
            raise HTTPException(status_code=404, detail=f"Terminology with id {terminology_id} not found")

        concept = Concept(terminology=terminology, name=name, id=id)
        repository.store(concept)
        return {"message": f"Concept {id} created or updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create or update concept: {str(e)}")


@app.get("/mappings", tags=["mappings"])
async def get_all_mappings():
    mappings = repository.get_all_mappings()
    return mappings


@app.put("/concepts/{id}/mappings", tags=["concepts", "mappings"])
async def create_concept_and_attach_mapping(id: str, terminology_id: str, concept_name: str, text: str):
    try:
        terminology = repository.session.query(Terminology).filter(Terminology.id == terminology_id).first()
        if not terminology:
            raise HTTPException(status_code=404, detail=f"Terminology with id {terminology_id} not found")
        concept = Concept(terminology=terminology, name=concept_name, id=id)
        repository.store(concept)
        embedding = embedding_model.get_embedding(text)
        mapping = Mapping(concept=concept, text=text, embedding=embedding)
        repository.store(mapping)
        return {"message": f"Concept {id} created or updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create or update concept: {str(e)}")


@app.put("/mappings/", tags=["mappings"])
async def create_or_update_mapping(concept_id: str, text: str):
    try:
        concept = repository.session.query(Concept).filter(Concept.id == concept_id).first()
        if not concept:
            raise HTTPException(status_code=404, detail=f"Concept with id {concept_id} not found")
        embedding = embedding_model.get_embedding(text)
        mapping = Mapping(concept=concept, text=text, embedding=embedding)
        repository.store(mapping)
        return {"message": f"Mapping created or updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create or update mapping: {str(e)}")


@app.post("/mappings", tags=["mappings"])
async def get_closest_mappings_for_text(text: str, limit: int = 5):
    embedding = embedding_model.get_embedding(text).tolist()
    print(embedding)
    closest_mappings, similarities = repository.get_closest_mappings(embedding, limit)
    mappings = []
    for mapping, similarity in zip(closest_mappings, similarities):
        concept = mapping.concept
        terminology = concept.terminology
        mappings.append({
            "concept": {
                "id": concept.id,
                "name": concept.name,
                "terminology": {
                    "id": terminology.id,
                    "name": terminology.name
                }
            },
            "text": mapping.text,
            "similarity": similarity
        })
    return mappings


# Endpoint to get mappings for a data dictionary source
@app.post("/mappings/dict", tags=["mappings"], description="Get mappings for a data dictionary source.")
async def get_closest_mappings_for_dictionary(file: UploadFile = File(...), variable_field: str = 'variable', description_field: str = 'description'):
    try:
        # Determine file extension and create a temporary file with the correct extension
        _, file_extension = os.path.splitext(file.filename)
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp_file:
            tmp_file.write(await file.read())
            tmp_file_path = tmp_file.name

        # Initialize DataDictionarySource with the temporary file path
        data_dict_source = DataDictionarySource(file_path=tmp_file_path, variable_field=variable_field, description_field=description_field)
        df = data_dict_source.to_dataframe()

        response = []
        for _, row in df.iterrows():
            variable = row['variable']
            description = row['description']
            embedding = embedding_model.get_embedding(description)
            closest_mappings, similarities = repository.get_closest_mappings(embedding, limit=5)
            mappings_list = []
            for mapping, similarity in zip(closest_mappings, similarities):
                concept = mapping.concept
                terminology = concept.terminology
                mappings_list.append({
                    "concept": {
                        "id": concept.id,
                        "name": concept.name,
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
