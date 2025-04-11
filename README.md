# <img src="client/src/assets/logo_fhg.svg" alt="Logo" width="100"/> Kitsune ![GitHub Release](https://img.shields.io/github/v/release/SCAI-BIO/kitsune)


*Kitsune* is a next-generation data steward and harmonization tool. Building on the legacy of systems like Usagi, Kitsune leverages LLM embeddings to intelligently map semantically similar terms even when their string representations differ. This results in more robust data harmonization and improved performance in real-world scenarios.

(Formerly: INDEX – the Intelligent Data Steward Toolbox)


## Features

- **LLM Embeddings:** Uses state-of-the-art language models to capture semantic similarity.
- **Intelligent Mapping:** Improves over traditional string matching with context-aware comparisons.
- **Extensible:** Designed for integration into modern data harmonization pipelines.


## Installation

Run the frontend client, api vector database and local embedding model using the local docker-compose file: 

```bash
docker-compose -f docker-compose.local.yaml up
```

You can access the frontend on [localhost:4200](localhost:4200)

### Initial Data import

#TODO @mehmetcanay