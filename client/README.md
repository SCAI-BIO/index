# Client

- [Client](#client)
  - [Introduction](#introduction)
  - [Tutorial](#tutorial)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Starting the Frontend Locally](#starting-the-frontend-locally)
    - [Run the Frontend via Docker](#run-the-frontend-via-docker)

## Introduction

This repository contains the frontend code for the Kitsune web application. It allows users to find the closest semantic match in various ontologies via query search or cohort dictionary upload. The user can also visualize the Common Data Model of Healthy Living in table view or in chords diagram.

## Tutorial

For a detailed guide on using Angular, refer to the official [Angular Tutorial](https://angular.dev/tutorial).

## Requirements

- [Angular == 19.x.x](https://angular.dev/installation)
- [Node.js >= 18.19.1](https://nodejs.org/en/download/package-manager)
- TypeScript >= 5.5.0

## Installation

Install the project dependencies:

```bash
npm install
```

## Usage

### Starting the Frontend Locally

You can deploy a local version of the web application via Angular

You can access the web application on [localhost:4200](http://localhost:4200):

```bash
ng serve
```

### Run the Frontend via Docker

You can deploy a local version of the web application via docker.

You can either build the docker container locally or download the latest build from the Kitsune GitHub package registry.

To build the Docker container locally:

```bash
docker build -t ghcr.io/scai-bio/client/kitsune:latest .
```

To download the latest build:

```bash
docker pull ghcr.io/scai-bio/kitsune/client:latest
```

After build/download you will be able to start the container and access the Kitsune web application per default on [localhost:8080](http://localhost:8080/):

```bash
docker run -p 8080:80 ghcr.io/scai-bio/kitsune/client:latest
```
