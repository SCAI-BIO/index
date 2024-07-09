# INDEX – the Intelligent Data Steward Toolbox

![example workflow](https://github.com/SCAI-BIO/index/actions/workflows/tests.yml/badge.svg)
![GitHub Release](https://img.shields.io/github/v/release/SCAI-BIO/index)

INDEX is an intelligent data steward toolbox that leverages Large Language Model embeddings for automated Data-Harmonization.

## Table of Contents
- [Introduction](#introduction)
- [Installation](#installation)
  - [Local Development Server](#local-development-server)
    - [Starting the backend](#starting-the-backend)
    - [Starting the frontend](#starting-the-frontend)
  - [Docker](#docker)
- [Configuration](#configuration)

## Introduction

INDEX uses vector embeddings from variable descriptions to suggest mappings for datasets based on their semantic similarity. Mappings are stored with their vector representations in a knowledge base, where they can be used for subsequent harmonisation tasks, potentially improving suggestions with each iteration. The tool is designed to be configurable and extendable, adapting for specific use-cases through customizable models and databases.

## Installation

### Local Development Server

#### Starting the backend

```bash
cd api
pip install -r requirements.txt
uvicorn routes:app --reload --port 5000
```

Navigate to [localhost:5000](http://localhost:5000) to access the backend.

#### Starting the frontend

```bash
cd client
pip install -r requirements.txt
uvicorn routes:app --reload --port 5000
```

Navigate to [localhost:4200](http://localhost:4200) to access the frontend.

### Docker

You can start both frontend and API using docker-compose:

```bash
docker-compose -f docker-compose.local.yaml up
```

## Configuration

_TODO: Add configuration instructions_
