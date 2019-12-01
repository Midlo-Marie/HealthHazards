# Import our pymongo library, which lets us connect our Flask app to our Mongo database.
import pymongo
from pymongo import MongoClient
import pandas as pd
import json
import requests

# Create connection variable
conn = 'mongodb://localhost:27017'

# Pass connection to the pymongo instance.
client = pymongo.MongoClient(conn)

# Connect to a database. Will create one if not already available.
db = client.maps_db

# Drops collection if available to remove duplicates
db.maps.drop()
db.earthquake.drop()

# Creates a collection in the database and inserts two documents
# data = json.load(open("./data/output/natural_deaths_medicare.json"))
data = json.load(open("./data/output/us-states.json"))
db.maps.insert_many(data["features"])

death_data = json.load(open("./data/output/natural_deaths_medicare.json"))
db.maps.insert_many(death_data)

earthquake_data = requests.get("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").json()
db.earthquake.insert_one(earthquake_data)

