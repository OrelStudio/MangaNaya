# [MangaNaya](https://manganaya.com)

MangaNaya is a personal manga reading platform designed to provide a streamlined, ad-free, and customizable manga experience.

## Overview

MangaNaya is a full-stack application built using a monorepo structure. It consists of multiple microservices that handle different responsibilities, providing an efficient and dynamic manga-reading platform.

## Architecture

The application is structured into distinct services, each performing dedicated tasks:

- **Web**: Frontend application built with Next.js, serving as the user interface for reading manga and browsing the catalog.
- **API**: A GraphQL backend built using Hono.js that serves as the central point for data fetching and manipulation.
- **Scraper**: A dedicated service responsible for retrieving manga metadata dynamically as needed.
- **Extractor**: Manages the downloading and storage of manga chapters and their thumbnails to AWS S3, on-demand.

## Technology Stack

- **Monorepo Management**: Turborepo with Bun as package manager
- **Frontend Framework**: Next.js
- **Backend Framework**: Hono.js
- **API Layer**: GraphQL
- **Containerization and Deployment**: Google Kubernetes Engine (GKE)
- **Container Registry**: Google Artifact Registry
- **Database**: AWS RDS (PostgreSQL)
- **File Storage**: AWS S3
- **Messaging**: AmazonMQ (RabbitMQ)
- **Caching**: Redis

## Key Features

- **Dynamic Manga Catalog**: Manga metadata and chapters are fetched and stored dynamically upon user requests.
- **On-Demand Chapter Loading**: Chapters are downloaded and cached seamlessly when a user requests to read them.
- **Search Functionality**: Users can search within existing manga entries and request new entries dynamically.
- **Scalable Queue System**: A reactive queue system manages resource-intensive tasks like chapter extraction efficiently.

## Infrastructure

MangaNaya employs a modern cloud-native infrastructure designed for scalability and cost efficiency:

- Deployed via Continuous Integration and Continuous Deployment (CI/CD) pipelines to Google Kubernetes Engine (GKE).
- Utilizes cloud-managed services from AWS and Google Cloud to ensure efficient performance and reliable data management.

## Challenges and Solutions

- **Dynamic Data Handling**: Initially faced challenges managing large pre-downloaded manga data; solved by dynamically loading manga and chapters on user demand.
- **Resource Management**: High memory usage resolved by separating scraper and extractor services and implementing an efficient queuing system.
- **Cloud Optimization**: Optimized deployment on cloud infrastructure to balance performance, reliability, and cost efficiency.
