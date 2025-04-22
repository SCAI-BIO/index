import logging
import os
from enum import Enum
from urllib.parse import urlparse

from datastew.embedding import Vectorizer
from datastew.repository import WeaviateRepository
from dotenv import load_dotenv

load_dotenv()

weaviate_url = os.getenv("WEAVIATE_URL", "http://localhost:8080")
model_name = os.getenv("MODEL_NAME", "sentence-transformers/all-MiniLM")
hugging_face_api_key = os.getenv("HF_KEY", None)
ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
logger = logging.getLogger("uvicorn.info")

parsed_weaviate_url = urlparse(weaviate_url)
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


class WeaviateClient(WeaviateRepository):
    def __init__(self):
        super().__init__(
            mode="remote",
            path=str(parsed_weaviate_url.hostname),
            port=parsed_weaviate_url.port if parsed_weaviate_url.port else 80,
            vectorizer=Vectorizer(model_name, api_key=hugging_face_api_key, host=modified_ollama_url),
        )

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        if self.client:
            self.client.close()
