import logging
from abc import ABC
import numpy as np
import openai
from sentence_transformers import SentenceTransformer


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
                logging.warning(f"Empty text passed to get_embedding")
                return None
            if isinstance(text, str):
                text = text.replace("\n", " ")
            return openai.Embedding.create(input=[text], model=model)["data"][0]["embedding"]
        except Exception as e:
            logging.error(f"Error getting embedding for {text}: {e}")
            return None

    def get_embeddings(self, messages: [str], model="text-embedding-ada-002", max_chunk_length=2048):
        embeddings = []
        for message in messages:
            if len(message) <= max_chunk_length:
                embeddings.append(self.get_embedding(message, model))
            else:
                # Split message into chunks
                chunks = [message[i:i+max_chunk_length] for i in range(0, len(message), max_chunk_length)]
                for idx, chunk in enumerate(chunks):
                    logging.info(f'Processing chunk {idx}/{len(chunks)}')
                    embeddings.append(self.get_embedding(chunk, model))
        return embeddings


class MPNetAdapter(EmbeddingModel):
    def __init__(self, model="sentence-transformers/all-mpnet-base-v2"):
        logging.getLogger().setLevel(logging.INFO)
        self.mpnet_model = SentenceTransformer(model)

    def get_embedding(self, text: str):
        logging.info(f"Getting embedding for {text}")
        try:
            if text is None or text == "" or text is np.nan:
                logging.warn(f"Empty text passed to get_embedding")
                return None
            if isinstance(text, str):
                text = text.replace("\n", " ")
            return self.mpnet_model.encode(text)
        except Exception as e:
            logging.error(f"Error getting embedding for {text}: {e}")
            return None

    def get_embeddings(self, messages: [str]) -> [[float]]:
        try:
            embeddings = self.mpnet_model.encode(messages)
        except Exception as e:
            logging.error(f"Failed for messages {messages}")
        flattened_embeddings = [[float(element) for element in row] for row in embeddings]
        return flattened_embeddings


class TextEmbedding:
    def __init__(self, text: str, embedding: [float]):
        self.text = text
        self.embedding = embedding
