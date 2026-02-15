
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from db import database
from utils import create_access_token, create_refresh_token
import bcrypt

router = APIRouter()

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    query = "SELECT userid, username, password, role FROM users WHERE username = :username"
    user = await database.fetch_one(query, {"username": form_data.username})
    if not user or not bcrypt.checkpw(form_data.password.encode(), user["password"].encode()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    token_data = {"sub": user["username"], "role": user["role"]}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    return {
        "userid": user["userid"],
        "role": user["role"],
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
