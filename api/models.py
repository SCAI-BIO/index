import logging
import os
from enum import Enum
from urllib.parse import urlparse

from datastew.repository import WeaviateRepository
from datastew.repository.weaviate_schema import MappingSchema
from dotenv import load_dotenv

from weaviate.classes.config import Configure, DataType, Property

load_dotenv()

weaviate_url = os.getenv("WEAVIATE_URL", "localhost")
ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
logger = logging.getLogger("uvicorn.info")

# If Weaviate is running inside a Docker container, pass the Ollama API URL with host.docker.internal:port.
# Use http://localhost:port if WeaviateRepository `mode` is set to memory
parsed_ollama_url = urlparse(ollama_url)
if parsed_ollama_url.hostname == "localhost":
    modified_ollama_url = f"http://host.docker.internal:{parsed_ollama_url.port}"
else:
    modified_ollama_url = ollama_url


class ObjectSchema(Enum):
    TERMINOLOGY = "terminology"
    CONCEPT = "concept"
    MAPPING = "mapping"


mapping_schema = MappingSchema(
    properties=[Property(name="text", data_type=DataType.TEXT)],
    vectorizer_config=[
        Configure.NamedVectors.text2vec_ollama(
            name="nomic_embed_text",
            source_properties=["text"],
            api_endpoint=modified_ollama_url,
            model="nomic-embed-text",
            vectorize_collection_name=False,
        )
    ],
)


class WeaviateClient(WeaviateRepository):
    def __init__(self):
        super().__init__(
            use_weaviate_vectorizer=True,
            mode="remote",
            path=weaviate_url,
            port=8080 if weaviate_url == "localhost" else 80,
            mapping_schema=mapping_schema,
        )

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        if self.client:
            self.client.close()
