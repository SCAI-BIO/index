# INDEX – the Intelligent Data Steward Toolbox

![example workflow](https://github.com/SCAI-BIO/index/actions/workflows/tests.yml/badge.svg) ![GitHub Release](https://img.shields.io/github/v/release/SCAI-BIO/index)

INDEX is an intelligent data steward toolbox that leverages Large Language Model embeddings for automated Data-Harmonization. 

## Table of Contents
- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)

## Introduction

INDEX uses vector embeddings from variable descriptions to suggest mappings for datasets based on their semantic 
similarity. Mappings are stored with their vector representations in a knowledge base, where they can be used for 
subsequent harmonisation tasks, potentially improving the following suggestions with each iteration. Models for 
the computation as well as databases for storage are meant to be configurable and extendable to adapt the tool for
specific use-cases.

## Installation

```bash
uvicorn api.routes:app --reload --port 5000
```

### Run the Backend via Docker

The API can also be run via docker.

You can either build the docker container locally or download the latest build from the index GitHub package registry. 


```bash
docker build . -t ghcr.io/scai-bio/api/backend:latest
```

```bash
docker pull ghcr.io/scai-bio/api/backend:latest
```

After build/download you will be able to start the container and access the INDEX API per default on [localhost:5000](http://localhost:8000):

```bash
docker run  -p 8000:80 ghcr.io/api/scai-bio/backend:latest
```

## Configuration

### Description Embeddings

You can configure INDEX to use either a local language model or call OPenAPIs embedding API. While using the OpenAI API
is significantly faster, you will need to provide an API key that is linked to your OpenAI account. 

Currently, the following local models are implemented:
* [Sentence Transformer (MPNet)](https://huggingface.co/docs/transformers/model_doc/mpnet)

The API will default to use a local embedding model. You can adjust the model loaded on start up in the configurations.

### Database

INDEX will by default store mappings in a file based db file in the [index/db](api/db) dir. For testing purposes
the initial SQLLite file based db contains a few of mappings to concepts in SNOMED CT. All available database adapter 
implementations can be found in [index/repository](api/repository).

To exchange the DB implementation, load your custom DB adapter or pre-saved file-based DB file on application startup
[here](https://github.com/SCAI-BIO/index/blob/923601677fd62d50c3748b7f11666420e82df609/index/api/routes.py#L14). 
The same can be done for any other embedding model.
