import logging
import os
from enum import Enum

from datastew.repository import WeaviateRepository
from dotenv import load_dotenv

load_dotenv()

weaviate_url = os.getenv("WEAVIATE_URL", "localhost")
huggingface_key = os.getenv("HUGGINGFACE_KEY")

logger = logging.getLogger("uvicorn.info")


class ObjectSchema(Enum):
    TERMINOLOGY = "terminology"
    CONCEPT = "concept"
    MAPPING = "mapping"


class WeaviateClient(WeaviateRepository):
    def __init__(self):
        super().__init__(
            use_weaviate_vectorizer=bool(huggingface_key),
            huggingface_key=huggingface_key,
            mode="remote",
            port=8080 if weaviate_url == "localhost" else 80,
        )

    def __enter__(self):
        return self.client

    def __exit__(self, exc_type, exc_value, traceback):
        if self.client:
            self.client.close()
