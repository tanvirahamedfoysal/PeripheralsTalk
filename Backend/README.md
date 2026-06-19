# PeripheralsTalk Backend

A FastAPI backend for managing peripherals and device communication.

## Project Structure

```
./
├── __init__.py
├── main.py                         # FastAPI app initialization
├── api/                            # API routers
│   ├── __init__.py
│   ├── auth.py
│   ├── article.py
│   ├── category.py
│   ├── comment.py
│   ├── profile.py
│   └── utility.py
├── auth/                           # Authentication utilities
│   └── utilities.py
├── core/                           # Core settings
│   ├── __init__.py
│   └── config.py
├── db/                             # Database configuration
│   ├── __init__.py
│   └── database.py
├── models/                         # ORM models
│   ├── __init__.py
│   ├── base.py
│   └── device.py
├── schemas/                        # Pydantic schemas
│   ├── __init__.py
│   └── base.py
├── services/                       # External service integrations
│   ├── brevo/
│   └── cloudinary/
├── .env                            # Environment variables (local)
├── pyproject.toml                  # Project dependencies
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.12+
- [uv](https://github.com/astral-sh/uv) (optional)

### Installation

1. From the repository root:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

3. Install the project dependencies:
   ```bash
   pip install -e ".[dev]"
   ```

4. Create or update environment variables:
   ```bash
   cp .env.example .env
   # Edit .env as needed
   ```

> `.env` is not committed to version control. Use `.env.example` as a safe template.

### Running the Application

```bash
# Run directly from the Backend package directory
cd Backend
python main.py

# Or run from the repository root with an explicit module path
uvicorn Backend.main:app --reload --host 0.0.0.0 --port 8000
```

The API is available at `http://localhost:8000`.

### Available Endpoints

- `GET /api/v1/health` — health check
- `GET /api/v1/auth-status` — authentication status placeholder

### API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Development

### Useful Commands

```bash
# Format code
black Backend

# Sort imports
isort Backend

# Lint
flake8 Backend

# Type check
mypy Backend
```

## Adding New Features

1. Create a model in `app/models/`.
2. Create matching Pydantic schemas in `app/schemas/`.
3. Add database operations in `app/crud/`.
4. Add routes under `Backend/api/`.
5. Include new routers through `Backend/api/__init__.py`.

## Configuration

Application settings are loaded from environment variables in `Backend/core/config.py`.

### Environment Variables

See `.env.example` for all available options. Key variables:

- `SECRET_KEY`: Secret key for JWT tokens (change in production!)
- `DATABASE_URL`: Database connection string
- `DEBUG`: Enable debug mode
- `ENVIRONMENT`: Deployment environment (development/production)

## Database Schema

This project does not use Alembic for migrations. Manage your schema and migrations using your preferred tooling (production-ready database URL is expected in `.env`).

## Best Practices

### 1. Dependency Injection
Always use FastAPI's dependency injection system:
```python
from fastapi import Depends
from app.db import get_db

@app.get("/items/")
def get_items(db: Session = Depends(get_db)):
    return db.query(Item).all()
```

### 2. Error Handling
Define custom exception handlers:
```python
from fastapi import HTTPException, status

raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Item not found"
)
```

### 3. Type Hints
Always use type hints for better code clarity and IDE support:
```python
def get_user(user_id: int, db: Session = Depends(get_db)) -> UserResponse:
    return db.query(User).filter(User.id == user_id).first()
```

### 4. Async Operations
Use async/await for I/O operations:
```python
@app.get("/items/")
async def get_items(db: Session = Depends(get_db)):
    return db.query(Item).all()
```

### 5. Response Models
Always define Pydantic models for responses:
```python
@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int):
    ...
```

## Deployment

### Environment Setup

Before deployment, ensure:

1. Set `DEBUG = false` in `.env`
2. Update `SECRET_KEY` to a secure value
3. Configure production `DATABASE_URL`
4. Set `ENVIRONMENT = production`

### Docker

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY pyproject.toml .
RUN pip install .

COPY . .

CMD ["uvicorn", "Backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Production Server

Use a production-grade ASGI server:

```bash
# Using Gunicorn with Uvicorn workers
gunicorn -w 4 -k uvicorn.workers.UvicornWorker Backend.main:app
```

## Security Considerations

- [ ] Never commit `.env` file to version control
- [ ] Use strong `SECRET_KEY` in production
- [ ] Implement proper authentication/authorization
- [ ] Validate and sanitize all user inputs
- [ ] Use HTTPS in production
- [ ] Keep dependencies updated: `pip list --outdated`

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Uvicorn Documentation](https://www.uvicorn.org/)

## License

This project is part of PeripheralsTalk.
 