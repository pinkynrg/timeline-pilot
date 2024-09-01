from flask import Blueprint, jsonify, request
import google.generativeai as genai
from geoalchemy2.elements import WKTElement
from models import Location
from server import db
from datetime import datetime, UTC
from sqlalchemy import func
from geoalchemy2.shape import to_shape
import requests
import json
import os

main_blueprint = Blueprint('main', __name__)

@main_blueprint.route('/', methods=['GET'])
def server_up():
    return 'server is up!', 200

@main_blueprint.route('/utc-datetime', methods=['GET'])
def get_utc_datetime():
    current_utc_datetime = datetime.now(UTC).isoformat() + 'Z'
    return jsonify({"utc_datetime": current_utc_datetime}), 200

@main_blueprint.route('/ask', methods=['GET'])
def ask():
    question = request.args.get('question')

    if not question:
        return jsonify({"error": "question parameter is required"}), 400

    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel("gemini-1.5-flash")
    query = '''
    I need to tell me if the following text is requesting a precise location or not.
    If yes return me only the name of request place.
    If the question is: Rome, return "Rome"
    If the question is: Did I go to the Eiffel Tower? return "Eiffel Tower"
    If the question is: When did I go to Reggio Emilia? return "Reggio Emilia"
    and so on...
    no line breaks in the response.
    Otherwise return me the string invalid.
    The question is: {}
    '''.format(question)
    response = model.generate_content(query)

    if "invalid" in response.text:
        return jsonify({
            "error": "invalid request",
            "question": question,
            "query": query,
        }), 200    

    address = response.text.strip()

    # PositionStack API key and endpoint
    access_key = os.environ.get('POSITIONSTACK_API_KEY')
    api_url = f"https://api.positionstack.com/v1/forward?access_key={access_key}&query={address}"

    # Make the request to PositionStack API
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        data = response.json()

        # Extract latitude and longitude from the response
        if 'data' not in data or len(data['data']) == 0:
            return jsonify({"error": "No results found for the address"}), 404

        # Assuming we use the first result
        result = data['data'][0]
        lat = result['latitude']
        lon = result['longitude']

        # Define the distance (1 === 100 km)
        distance = 0.1

        # Query to get the earliest location per day within the distance
        subquery = db.session.query(
            func.date(Location.timestamp).label('day'),
            func.min(Location.timestamp).label('min_timestamp')
        ).filter(
            func.ST_Distance(
                Location.coordinates,
                func.ST_SetSRID(func.ST_MakePoint(lon, lat), 3857)
            ) <= distance
        ).group_by(
            func.date(Location.timestamp)
        ).subquery()

        # Join the subquery with the Location table to get the full location data
        earliest_locations = db.session.query(
            Location
        ).join(
            subquery, 
            (Location.timestamp == subquery.c.min_timestamp)
        ).all()

        # Convert the results to the desired format
        result_list = [
            {
                "timestamp": location.timestamp.isoformat(),
                "coordinates": {
                    "id": location.id,
                    "lat": to_shape(location.coordinates).y,  # Extract latitude
                    "lon": to_shape(location.coordinates).x   # Extract longitude
                }
            }
            for location in earliest_locations
        ]

        # Return the list of earliest locations per day
        return jsonify(result_list), 200

    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500    

@main_blueprint.route('/points', methods=['GET'])
def points():
    try:
        # Get the date parameter from query parameters
        date_str = request.args.get('timestamp')

        if date_str:
            # Validate and parse the date parameter
            try:
                filter_date = datetime.fromisoformat(date_str).date()
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

            # Build the query to get all locations for the specified date without grouping
            locations = db.session.query(Location).filter(
                func.date(Location.timestamp) == filter_date
            ).all()

            # Convert the results to the desired format
            result_list = [
                {
                    "timestamp": location.timestamp.isoformat(),
                    "coordinates": {
                        "id": location.id,
                        "lat": to_shape(location.coordinates).y,  # Extract latitude
                        "lon": to_shape(location.coordinates).x   # Extract longitude
                    }
                }
                for location in locations
            ]

        else:
            # Build the query to group locations by day
            subquery = db.session.query(
                func.date(Location.timestamp).label('day'),
                func.min(Location.timestamp).label('min_timestamp')
            ).group_by(
                func.date(Location.timestamp)
            ).subquery()

            # Join the subquery with the Location table to get the full location data
            earliest_locations = db.session.query(
                Location
            ).join(
                subquery, 
                (Location.timestamp == subquery.c.min_timestamp)
            ).all()

            # Group locations by date
            grouped_locations = {}
            for location in earliest_locations:
                point = to_shape(location.coordinates)  # Convert WKBElement to Shapely object
                date_key = location.timestamp.date().isoformat()  # Group by date (YYYY-MM-DD)

                if date_key not in grouped_locations:
                    grouped_locations[date_key] = {
                        "timestamp": location.timestamp.isoformat(),
                        "coordinates": {
                            "id": location.id,
                            "lat": point.y,  # Extract latitude
                            "lon": point.x   # Extract longitude
                        }
                    }

            # Convert the grouped locations to a list of dictionaries
            result_list = list(grouped_locations.values())

        # Return the list of locations (filtered or grouped)
        return jsonify(result_list), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@main_blueprint.route('/load', methods=['GET'])
def load_data():
    try:
        with open('Records.json', 'r') as file:
            data = json.load(file)
        
        for record in data['locations']:
            x = record['longitudeE7'] / 1e7
            y = record['latitudeE7'] / 1e7
            new_record = Location(
                coordinates=WKTElement(f'POINT({x} {y})', srid=3857),
                timestamp=record['timestamp'],
            )
            db.session.add(new_record)
        
        db.session.commit()
        return jsonify({"message": "Data loaded successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500