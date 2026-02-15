FROM python:3.9-slim


# Set the working directory for build steps
WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Set PYTHONPATH so 'app' is found
ENV PYTHONPATH=/app


# Copy the app source code
COPY ./app ./app


# Change to the app directory for runtime
WORKDIR /app/app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]