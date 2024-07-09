# INDEX – the Intelligent Data Steward Toolbox

![GitHub Release](https://img.shields.io/github/v/release/SCAI-BIO/index)

INDEX is an intelligent data steward toolbox that leverages Large Language Model embeddings for automated Data-Harmonization.

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
