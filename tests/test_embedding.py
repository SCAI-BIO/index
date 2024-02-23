import unittest
from index.embedding import SentenceTransformerAdapter, TextEmbedding
import numpy as np

class TestEmbedding(unittest.TestCase):

    def setUp(self):
        self.sentence_transformer_adapter = SentenceTransformerAdapter(model="sentence-transformers/all-mpnet-base-v2")

    def test_sentence_transformer_adapter_get_embedding(self):
        text = "This is a test sentence."
        embedding = self.sentence_transformer_adapter.get_embedding(text)
        self.assertIsInstance(embedding, np.ndarray)
        self.assertEqual(len(embedding), 768)

    def test_sentence_transformer_adapter_get_embeddings(self):
        messages = ["This is message 1.", "This is message 2."]
        embeddings = self.sentence_transformer_adapter.get_embeddings(messages)
        self.assertIsInstance(embeddings, list)
        self.assertEqual(len(embeddings), len(messages))
        self.assertEqual(len(embeddings[0]), 768)

    def test_text_embedding(self):
        text = "This is a test sentence."
        embedding = [0.1, 0.2, 0.3, 0.4]
        text_embedding = TextEmbedding(text, embedding)
        self.assertEqual(text_embedding.text, text)
        self.assertEqual(text_embedding.embedding, embedding)
