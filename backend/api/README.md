# dashe-demo-app-api

This is a FastAPI application designed to demonstrate the structure and functionality of a simple API. 

## Project Structure

```
dashe-demo-app-api
├── app
│   ├── main.py          # Entry point of the FastAPI application
│   ├── api
│   │   └── routes.py    # API routes definition
│   ├── models
│   │   └── __init__.py   # Data models
│   └── schemas
│       └── __init__.py   # Pydantic schemas for data validation
├── Dockerfile            # Dockerfile for building the application image
├── requirements.txt      # Python dependencies
└── README.md             # Project documentation
```

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd dashe-demo-app-api
   ```

2. **Install dependencies**:
   You can install the required dependencies using pip:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**:
   You can run the FastAPI application using the command:
   ```bash
   uvicorn app.main:app --reload
   ```

4. **Access the API**:
   Open your browser and go to `http://127.0.0.1:8000/docs` to see the interactive API documentation.

## Docker Setup

To run the application in a Docker container, ensure you have Docker installed and follow these steps:

1. **Build the Docker image**:
   ```bash
   docker build -t dashe-demo-app-api .
   ```

2. **Run the Docker container**:
   ```bash
   docker run -d -p 8000:8000 dashe-demo-app-api
   ```

3. **Access the API**:
   Open your browser and go to `http://127.0.0.1:8000/docs`.

## Shared Docker Compose

A shared `docker-compose.yml` file should be placed in the parent directory (e.g., `C:\git\Dashe`). This file will help manage multiple projects and their services efficiently.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.