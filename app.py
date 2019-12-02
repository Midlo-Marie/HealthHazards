#!/usr/bin/env python

import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, jsonify
from flask import Flask, request, render_template, redirect

from flask_pymongo import PyMongo

from bson.json_util import dumps
import copy
import requests 

# Use PyMongo to establish Mongo connection

app = Flask(__name__)

mongo = PyMongo(app, uri="mongodb://localhost:27017/maps_db")

# Route to render index.html template using data from Mongo
@app.route("/")
def index():
  return render_template("index_final.html")

# Route to render data for deaths by natural causes map using data from Mongo
@app.route("/api/map/deaths")
def dataDeaths():

    # Find one record of data from the mongo database
    print("Get maps data")
    maps_data = mongo.db.maps.find({ "type": "Feature" })
    death_data = mongo.db.maps.find({"Cause Name": { "$exists": True }})
    merged_data = merge_geojson(maps_data, death_data, "State", ["Year", "Cause Name"])
    print("Got maps data")
    print("Serializing maps data")
    maps_json = dumps({ "type": "FeatureCollection", "features": merged_data })
    print("Serialized maps data")
    return maps_json


# Route to render data for medicare spending map using data from Mongo
@app.route("/api/map/medicare")
def dataMedicare():

    # Find one record of data from the mongo database
    print("Get maps data")
    maps_data = mongo.db.maps.find({ "type": "Feature" })
    medicare_data = mongo.db.maps.find({"normalized_medicare_spending": { "$exists": True }})
    merged_data = merge_geojson(maps_data, medicare_data, "State", ["Year"])
    print("Got maps data")
    print("Serializing maps data")
    maps_json = dumps({ "type": "FeatureCollection", "features": merged_data })
    print("Serialized maps data")
    return maps_json


# Route to render data for bubble chart using data from Mongo
@app.route("/api/chart/bubble")
def chartMedicare():

    # Find one record of data from the mongo database
  
    medicare_data = mongo.db.maps.find({
      "normalized_medicare_spending": { "$exists": True, "$ne": None }
    }, projection={
      "normalized_medicare_spending": 1, "normalized_deaths": 1, "Cause Name": 1, "Year": 1, "State": 1
    })

 
    return dumps(medicare_data)

# Route to render USGS Earthquake data using data from Mongo
@app.route("/api/map/earthquake")
def dataEarthquake():

    # Find one record of data from the mongo database
  
    earthquake_data = mongo.db.earthquake.find_one()
    print(earthquake_data)

    return dumps(earthquake_data)


# Route that will trigger the scrape function
@app.route("/api/map/earthquake/refresh")
def refresh():

    # Run the scrape function
    earthquake_data = requests.get("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").json()
  
    # Update the Mongo database using update and upsert=True
    mongo.db.earthquake.update({}, earthquake_data, upsert=True)

    # Redirect back to home page
    return redirect("/api/map/earthquake", 302)

def merge_geojson(left, right, key, col_suffix = [], exclude=""):
  """
  merges a geojson dict with a list of dicts based on a common key, and can suffix joined keys based on value of specific col_suffix 
  """
  by_index = {}
  _left = list(left)
  _right = list(right)
  for feature in _left:
    value = feature["properties"][key]
    if value in by_index:
      by_index[value].append(feature)
    else:
      by_index[value] = [feature]
  for record in _right:
    value = record[key]
    suffix = ""
    for col in col_suffix:
      suff = str(record[col])
      suffix += "_" + suff
    matches = by_index[value]
    for feature in matches:
      for k, v in record.items():
        if k == key or k in col_suffix:
          continue
        feature["properties"][k + suffix] = v
  return _left

if __name__ == "__main__":
    app.run(debug=True)

