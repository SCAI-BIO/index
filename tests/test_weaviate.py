import weaviate
from weaviate.embedded import EmbeddedOptions

client = weaviate.WeaviateClient(
    embedded_options=EmbeddedOptions(
        additional_env_vars={
            "ENABLE_MODULES": "backup-filesystem,text2vec-openai,text2vec-cohere,text2vec-huggingface,ref2vec-centroid,generative-openai,qna-openai",
            "BACKUP_FILESYSTEM_PATH": "/tmp/backups"
        }
    )
    # Add additional options here (see Python client docs for syntax)
)

client.connect()  # Call `connect()` to connect to the server when you use `WeaviateClient`

# Add your client code here.

# Uncomment the next line to exit the Embedded Weaviate server.
client.close()