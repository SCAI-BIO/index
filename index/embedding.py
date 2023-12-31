import logging
from abc import ABC
import numpy as np
import openai


class EmbeddingModel(ABC):

    def get_embedding(self, text: str) -> [float]:
        pass

    def get_embeddings(self, messages: [str]) -> [[float]]:
        pass


class GPT4Adapter(EmbeddingModel):

    def __init__(self, api_key: str):
        self.api_key = api_key
        openai.api_key = api_key
        logging.getLogger().setLevel(logging.INFO)

    def get_embedding(self, text: str, model="text-embedding-ada-002"):
        logging.info(f"Getting embedding for {text}")
        try:
            if text is None or text == "" or text is np.nan:
                logging.warn(f"Empty text passed to get_embedding")
                return None
            if isinstance(text, str):
                text = text.replace("\n", " ")
            return openai.Embedding.create(input=[text], model=model)['data'][0]['embedding']
        except Exception as e:
            logging.error(f"Error getting embedding for {text}: {e}")
            return None

    def get_embeddings(self, messages: [str], model="text-embedding-ada-002"):
        # store index of nan entries
        response = openai.Embedding.create(input=messages, model=model)
        return [item['embedding'] for item in response['data']]


class TextEmbedding:

    def __init__(self, text: str, embedding: [float]):
        self.text = text
        self.embedding = embedding
