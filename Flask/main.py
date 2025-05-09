from fastapi import FastAPI
from routes.upload_routes import router

app = FastAPI()

# Register upload route
app.include_router(router)

# Optional root route
@app.get("/")
def read_root():
    return {"message": "FastAPI Audio Upload Service"}


# uvicorn main:app --reload