# Notes App : ECS Fargate

A simple full-stack notes app (React + Express + Postgres), containerized with Docker and deployed to AWS ECS Fargate via GitHub Actions.

## Stack

- **Frontend:** React + Vite (built and served as static files by the backend)
- **Backend:** Express (Node.js), serves the API and the built frontend
- **Database:** PostgreSQL (RDS in production, containerized locally)
- **Infra:** Docker, AWS ECR, AWS ECS Fargate, AWS Secrets Manager
- **CI/CD:** GitHub Actions  build, push to ECR, deploy to ECS on every push to `main`

## Project structure

```
.
├── frontend/          # React + Vite app
├── backend/           # Express API, serves frontend build from ./public
├── Dockerfile          # Multi-stage build: frontend -> static assets, backend -> server
├── docker-compose.yml  # Local dev: app + Postgres
└── .github/workflows/deploy.yml  # CI/CD pipeline
```

## Running locally

Requires Docker and Docker Compose.

```bash
docker compose up --build
```

This starts Postgres and the app together. The app is available at [http://localhost:3000](http://localhost:3000).

## API

| Method | Route          | Description                           |
| ------ | -------------- | ------------------------------------- |
| GET    | `/health`    | Health check                          |
| GET    | `/api/notes` | List all notes                        |
| POST   | `/api/notes` | Create a note (`{ "body": "..." }`) |

## Environment variables

| Variable        | Description                                      |
| --------------- | ------------------------------------------------ |
| `DB_HOST`     | Postgres host                                    |
| `DB_PORT`     | Postgres port (default`5432`)                  |
| `DB_USER`     | Postgres user                                    |
| `DB_PASSWORD` | Postgres password (from Secrets Manager in prod) |
| `DB_NAME`     | Postgres database name                           |
| `DB_SSL`      | `"true"` to enable SSL (used against RDS)      |
| `PORT`        | Port the server listens on (default`3000`)     |

## Deployment

Pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which:

1. Builds the Docker image and pushes it to Amazon ECR, tagged with the commit SHA and `latest`
2. Fetches the current ECS task definition
3. Renders a new revision pointing at the freshly pushed image
4. Registers the new revision and updates the ECS service, waiting for the rolling deployment to stabilize

### AWS resources

- **ECR repository:** `notes-ecs-pipeline`
- **ECS cluster:** `notes-ecs-pipeline-cluster`
- **ECS service:** `notes-app-service`
- **Task definition family:** `notes-ecs-pipeline-task`
- **Secrets:** `DB_PASSWORD` is injected at runtime from AWS Secrets Manager, resolved via the task's execution role

### Required GitHub secrets

| Secret                    | Description                                     |
| ------------------------- | ----------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | IAM user with ECR push + ECS deploy permissions |
| `AWS_SECRET_ACCESS_KEY` | Secret for the above IAM user                   |


<img width="1016" height="422" alt="image" src="https://github.com/user-attachments/assets/d683c8f9-2ebd-4bd3-af65-fcec9d3ed75f" />

<img width="884" height="560" alt="image" src="https://github.com/user-attachments/assets/2bf08d07-7def-4e33-9bb5-0bbfcf8190a0" />
