
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.auth import router as auth_router
from api.routes import router as api_router
from dotenv import load_dotenv
from db import database

from faker import Faker

import bcrypt
import os
import asyncio

app = FastAPI()

# Load environment variables
load_dotenv()

# Allow CORS for frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv(f"ALLOW_ORIGINS1"), os.getenv(f"ALLOW_ORIGINS2"), os.getenv(f"ALLOW_ORIGINS3"), os.getenv(f"ALLOW_ORIGINS4")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth_router)
app.include_router(api_router)

@app.on_event("startup")
async def startup():
    print("Startup event triggered.")
    # Retry database connection until ready
    max_attempts = 20
    for attempt in range(max_attempts):
        print(f"Attempting database.connect() (attempt {attempt+1})...")
        try:
            await database.connect()
            if database.is_connected:
                print(f"Database connection successful on attempt {attempt+1}")
                break
            else:
                print(f"Database connect() returned but is_connected is False on attempt {attempt+1}")
        except Exception as e:
            print(f"Database connection attempt {attempt+1} failed: {e}")
        if attempt == max_attempts - 1:
            raise RuntimeError(f"Database connection failed after {max_attempts} attempts.")
        await asyncio.sleep(5)
    print(f"Proceeding with database.is_connected = {database.is_connected}")

    if not database.is_connected:
        print("Database is not connected after retry loop. Aborting startup.")
        raise RuntimeError("Database is not connected after retry loop.")
    # Ensure database connection is established before any SQL
    max_attempts = 10
    for attempt in range(max_attempts):
        try:
            await database.connect()
            print(f"Database connection successful on attempt {attempt+1}")
            break
        except Exception as e:
            print(f"Database connection attempt {attempt+1} failed: {e}")
            if attempt == max_attempts - 1:
                raise RuntimeError(f"Database connection failed after {max_attempts} attempts: {e}")
            await asyncio.sleep(2)

    print("Dropping tables if they exist...")
    await database.execute("DROP TABLE IF EXISTS property_sales CASCADE;")
    await database.execute("DROP TABLE IF EXISTS properties CASCADE;")
    await database.execute("DROP TABLE IF EXISTS users CASCADE;")
    print("Tables dropped.")

    print("Creating tables...")
    await database.execute("""
        CREATE TABLE users (
            userid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL
        );
    """)
    await database.execute("""
        CREATE TABLE properties (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            address1 VARCHAR(255) NOT NULL,
            address2 VARCHAR(255),
            city VARCHAR(100) NOT NULL,
            postcode VARCHAR(20) NOT NULL,
            latitude DOUBLE PRECISION NOT NULL,
            longitude DOUBLE PRECISION NOT NULL
        );
    """)
    await database.execute("""
        CREATE TABLE property_sales (
            id SERIAL PRIMARY KEY,
            userid UUID NOT NULL,
            property_id UUID NOT NULL,
            sold_for NUMERIC(12, 2) NOT NULL,
            sold_date DATE NOT NULL,
            CONSTRAINT fk_user FOREIGN KEY(userid) REFERENCES users(userid) ON DELETE CASCADE,
            CONSTRAINT fk_property FOREIGN KEY(property_id) REFERENCES properties(id) ON DELETE CASCADE,
            CONSTRAINT unique_user_property UNIQUE (userid, property_id)
        );
    """)
    print("All tables created. Proceeding to seeding phase.")
    print("Seeding users table...")
    import uuid
    fake = Faker("en_GB")
    # Import passwords from .env
    user_passwords = [
        os.getenv(f"USER_PASSWORD_{i+1}") for i in range(7)
    ]
    admin_passwords = [
        os.getenv(f"ADMIN_PASSWORD_{i+1}") for i in range(3)
    ]
    # Check for missing passwords
    if any(p is None or p.strip() == "" for p in user_passwords + admin_passwords):
        raise RuntimeError("One or more USER_PASSWORD_X or ADMIN_PASSWORD_X values are missing or empty in .env")
    users = []
    for i in range(10):
        role = "user" if i < 7 else "admin"
        if role == "user":
            username = f"user{i+1}"
            password_plain = user_passwords[i]
        else:
            username = f"admin{i-6}"
            password_plain = admin_passwords[i-7]
        password_hashed = bcrypt.hashpw(password_plain.encode(), bcrypt.gensalt()).decode()
        users.append({
            "userid": str(uuid.uuid4()),
            "username": username,
            "password": password_hashed,
            "role": role
        })
    await database.execute_many(
        query="INSERT INTO users (userid, username, password, role) VALUES (:userid, :username, :password, :role)",
        values=users
    )
    print("Users table seeded.")

    print("Seeding properties table...")
    fake = Faker("en_GB")
    properties = []
    uk_city_bounds = {
        "London": (51.28, 51.70, -0.51, 0.23),
        "Birmingham": (52.38, 52.55, -1.98, -1.75),
        "Manchester": (53.36, 53.55, -2.32, -2.15),
        "Liverpool": (53.32, 53.48, -3.01, -2.83),
        "Leeds": (53.75, 53.90, -1.62, -1.42),
        "Sheffield": (53.32, 53.43, -1.56, -1.36),
        "Bristol": (51.40, 51.52, -2.65, -2.53),
        "Newcastle": (54.95, 55.05, -1.65, -1.55),
        "Glasgow": (55.80, 55.90, -4.35, -4.15),
        "Edinburgh": (55.90, 56.00, -3.25, -3.15),
        "Cardiff": (51.45, 51.55, -3.25, -3.05),
        "Belfast": (54.55, 54.65, -5.98, -5.88),
        "Nottingham": (52.90, 53.00, -1.22, -1.12),
        "Leicester": (52.60, 52.70, -1.18, -1.08),
        "Southampton": (50.88, 50.98, -1.48, -1.38),
        "Portsmouth": (50.78, 50.88, -1.12, -1.02),
        "Coventry": (52.38, 52.48, -1.60, -1.50),
        "Bradford": (53.76, 53.86, -1.85, -1.75),
        "Stoke-on-Trent": (53.00, 53.10, -2.23, -2.13),
        "Derby": (52.90, 53.00, -1.55, -1.45),
        "Plymouth": (50.35, 50.45, -4.18, -4.08),
        "Wolverhampton": (52.55, 52.65, -2.15, -2.05),
        "Hull": (53.70, 53.80, -0.40, -0.30),
        "Swansea": (51.60, 51.70, -3.98, -3.88),
        "Aberdeen": (57.10, 57.20, -2.15, -2.05),
        "Dundee": (56.45, 56.55, -2.99, -2.89),
        "Cambridge": (52.18, 52.28, 0.08, 0.18),
        "Oxford": (51.72, 51.82, -1.30, -1.20),
        "Reading": (51.42, 51.52, -0.99, -0.89),
        "Milton Keynes": (51.98, 52.08, -0.80, -0.70)
    }
    uk_cities = list(uk_city_bounds.keys())
    for _ in range(1000):
        address = fake.address().split("\n")
        address1 = address[0][:255]
        address2 = ""
        city = fake.random.choice(uk_cities)
        postcode = fake.postcode()[:20]
        lat_min, lat_max, lon_min, lon_max = uk_city_bounds[city]
        latitude = fake.random.uniform(lat_min, lat_max)
        longitude = fake.random.uniform(lon_min, lon_max)
        properties.append({
            "address1": address1,
            "address2": address2,
            "city": city,
            "postcode": postcode,
            "latitude": latitude,
            "longitude": longitude
        })
    await database.execute_many(
        query="""
            INSERT INTO properties (address1, address2, city, postcode, latitude, longitude)
            VALUES (:address1, :address2, :city, :postcode, :latitude, :longitude)
        """,
        values=properties
    )
    print("Properties table seeded.")

    print("Seeding property_sales table...")
    import random
    from datetime import date, timedelta
    # Fetch all userids and property ids
    userids = [user["userid"] for user in users]
    # Ensure userids are unique
    if len(userids) != len(set(userids)):
        print(f"WARNING: Duplicate userids detected! {len(userids)} total, {len(set(userids))} unique.")
    else:
        print(f"Userids: {len(userids)} unique.")
    # Get all property ids from the DB
    property_ids = await database.fetch_all("SELECT id FROM properties")
    property_ids = [row["id"] for row in property_ids]
    # Ensure property_ids are unique
    if len(property_ids) != len(set(property_ids)):
        print(f"WARNING: Duplicate property_ids detected! {len(property_ids)} total, {len(set(property_ids))} unique.")
    else:
        print(f"Property IDs: {len(property_ids)} unique.")
    years = [date.today().year - i for i in range(5)]
    sales = []
    properties_per_user = len(years) * 10
    properties_needed_per_user = len(years) * 10
    if len(property_ids) < properties_needed_per_user:
        raise RuntimeError(f"Not enough properties to assign {properties_needed_per_user} unique sales per user. Only {len(property_ids)} properties available.")
    for userid in userids:
        # For each user, pick a unique set of properties for all years (no repeats)
        shuffled_properties = property_ids.copy()
        random.shuffle(shuffled_properties)
        user_properties = shuffled_properties[:properties_needed_per_user]
        for i, year in enumerate(years):
            year_properties = user_properties[i*10:(i+1)*10]
            for property_id in year_properties:
                # Random sale amount between 100,000 and 1,000,000
                sold_for = round(random.uniform(100000, 1000000), 2)
                # Random date in the year
                start_date = date(year, 1, 1)
                end_date = date(year, 12, 31)
                delta_days = (end_date - start_date).days
                sold_date = start_date + timedelta(days=random.randint(0, delta_days))
                sales.append({
                    "userid": userid,
                    "property_id": property_id,
                    "sold_for": sold_for,
                    "sold_date": sold_date
                })
    print(f"Total sales: {len(sales)}. Should equal unique pairs.")
    await database.execute_many(
        query="""
            INSERT INTO property_sales (userid, property_id, sold_for, sold_date)
            VALUES (:userid, :property_id, :sold_for, :sold_date)
        """,
        values=sales
    )
    print("property_sales table seeded.")

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

