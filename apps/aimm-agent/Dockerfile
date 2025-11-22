FROM python:3.12-slim

WORKDIR /app

RUN pip install poetry
RUN poetry config virtualenvs.create false

COPY pyproject.toml .
RUN poetry install --only=main --no-root

COPY app.py .
COPY src/ src/
COPY .env* ./

EXPOSE 5000

CMD ["python", "app.py"]