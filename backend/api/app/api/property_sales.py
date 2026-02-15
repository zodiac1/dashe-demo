
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .auth import router as auth_router
from db import database
from fastapi import APIRouter
import jwt
import os
import logging
logger = logging.getLogger("property_sales_debug")
if not logger.hasHandlers():
    handler = logging.StreamHandler()
    formatter = logging.Formatter("%(levelname)s:%(name)s:%(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
logger.setLevel(logging.WARNING)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")

from fastapi import Query

router = APIRouter()

@router.get("/property-sales", tags=["property_sales"])
async def get_property_sales(
    current_user: dict = Depends(get_current_user),
    start_date: str = Query(None, description="Filter sales from this date (YYYY-MM-DD)"),
    end_date: str = Query(None, description="Filter sales up to this date (YYYY-MM-DD)")
):
    import sys
    print("[PRINT] Entered get_property_sales endpoint", file=sys.stderr)
    from datetime import datetime
    filters = []
    params = {}
    if start_date:
        try:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
            filters.append("CAST(ps.sold_date AS DATE) >= :start_date")
            params["start_date"] = start_date_obj
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD.")
    if end_date:
        try:
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
            filters.append("CAST(ps.sold_date AS DATE) <= :end_date")
            params["end_date"] = end_date_obj
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD.")
    if current_user.get("role") == "admin":
        query = """
            SELECT p.id as property_id, ps.userid, p.latitude, p.longitude, p.city, ps.sold_for, ps.sold_date
            FROM property_sales ps
            JOIN properties p ON ps.property_id = p.id
        """
        if filters:
            query += " WHERE " + " AND ".join(filters)
        print("[PRINT] About to log SQL query", file=sys.stderr)
        logger.warning(f"[DEBUG] SQL: {query}")
        logger.warning(f"[DEBUG] Params: {params}")
        print("[PRINT] About to fetch rows", file=sys.stderr)
        rows = await database.fetch_all(query, params)
        print(f"[PRINT] Rows fetched: {len(rows)}", file=sys.stderr)
        logger.warning(f"[DEBUG] Results: {len(rows)}")
    else:
        username = current_user.get("sub")
        user_row = await database.fetch_one("SELECT userid FROM users WHERE username = :username", {"username": username})
        if not user_row:
            raise HTTPException(status_code=404, detail="User not found")
        userid = user_row["userid"]
        query = """
            SELECT p.id as property_id, ps.userid, p.latitude, p.longitude, p.city, ps.sold_for, ps.sold_date
            FROM property_sales ps
            JOIN properties p ON ps.property_id = p.id
            WHERE ps.userid = :userid
        """
        if filters:
            query += " AND " + " AND ".join(filters)
        params["userid"] = userid
        print("[PRINT] About to log SQL query (user)", file=sys.stderr)
        logger.warning(f"[DEBUG] SQL: {query}")
        logger.warning(f"[DEBUG] Params: {params}")
        print("[PRINT] About to fetch rows (user)", file=sys.stderr)
        rows = await database.fetch_all(query, params)
        print(f"[PRINT] Rows fetched (user): {len(rows)}", file=sys.stderr)
        logger.warning(f"[DEBUG] Results: {len(rows)}")
    return [
        {
            "property_id": row["property_id"],
            "userid": row["userid"],
            "latitude": row["latitude"],
            "longitude": row["longitude"],
            "city": row["city"],
            "sold_for": float(row["sold_for"]),
            "sold_date": row["sold_date"].isoformat() if row["sold_date"] else None
        }
        for row in rows
    ]

router.include_router(auth_router)
async def get_users():
    query = "SELECT id, username, role FROM users"
    rows = await database.fetch_all(query)
    return rows
