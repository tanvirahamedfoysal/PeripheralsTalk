# PeripheralsTalk Backend

The backend is a FastAPI service that powers the PeripheralsTalk content platform. It exposes public routes for browsing categories and articles and protected routes for authentication, editorial workflows, comments, profiles, and administration.

## Current architecture

```text
Backend/
├── main.py                  # FastAPI application factory and startup lifecycle
├── api/                     # Route modules for auth, articles, comments, profiles, categories, admin, and utilities
├── auth/                    # Token, hashing, and access-control helpers
├── core/                    # Settings and environment initialization
├── db/                      # Async SQLAlchemy engine and session provider
├── schemas/                 # Pydantic request/response models
├── services/                # Integrations for email delivery and Cloudinary uploads
└── pyproject.toml           # Python dependencies and packaging metadata
```

## Runtime stack

- FastAPI with async route handlers
- SQLAlchemy async engine with PostgreSQL-ready configuration
- Pydantic settings for environment-based configuration
- JWT-based auth with role checks for editors and admins
- Cloudinary and Brevo integrations for media and email

## Local development

### Prerequisites

- Python 3.12+
- A local or remote PostgreSQL-compatible database (the default config points to SQLite for local development)

### Setup

```bash
cd Backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

Create a local environment file with the settings you need. The app reads variables from the backend .env file or the repository root .env.

```bash
cp .env .env.local  # if you need a starting point
```

### Run the API

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:

- http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Key backend capabilities

### Authentication and accounts

- Registration with OTP verification
- Login and JWT token validation
- Role-aware access checks for users, editors, and administrators
- Password reset flows

### Articles and publishing

- Create new article versions
- Update existing article content in place
- Retrieve published and versioned article data
- Admin-level article listing and publication controls

### Content and community

- Category and article lookup endpoints
- Comment and reply management
- Ratings, reports, and profile-related operations

## Configuration notes

The main settings object is defined in [core/config.py](core/config.py). Key values include:

- database_url
- secret_key
- internal_api_key
- cloudinary_cloud_name, cloudinary_api_key, cloudinary_api_secret
- smtp_host, smtp_port, smtp_username, smtp_password, mail_from
- debug, environment

## Development commands

```bash
# Run the API locally
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Format and lint (if installed)
black .
isort .
flake8 .
mypy .
```

## Operational guidance

- Keep secrets out of source control and use environment variables in deployment
- Use the production-ready database URL and secure secret values in non-development environments
- Treat the API as the authoritative backend for article and account data
 