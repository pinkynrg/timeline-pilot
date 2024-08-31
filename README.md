# timeline-pilot

**timeline-pilot** is an interactive web application that allows you to visualize and analyze your Google Timeline data, downloaded through Google Takeout. The application integrates various technologies to provide a rich user experience, enabling you to explore your location history on a map and interact with the data using natural language queries.

## Features

- **Leaflet for Maps**: Visualize your location data on an interactive map. Leaflet is used to plot all the points from your Google Timeline, giving you a clear view of where you've been.
- **PostgreSQL + PostGIS**: Location data is stored in a PostgreSQL database, with PostGIS extensions for spatial queries. This allows for efficient storage and querying of geographical data.
- **Gemini AI**: Interact with your data using human-like questions. Ask when you visited a specific location, and Gemini will return a list of dates, allowing you to explore the corresponding paths on those days.
- **Position Stack for Geocoding**: Reverse geocode locations to get human-readable addresses from coordinates, making it easier to understand where you were at a given time.

## How It Works

1. **Upload Google Timeline Data**: Start by uploading your Google Timeline data, which you can download through Google Takeout. The data is parsed and stored in the PostgreSQL database with PostGIS for spatial processing.

2. **Interactive Map**: Using Leaflet, the application plots all your recorded locations on an interactive map. You can zoom in and out, click on points to see details, and explore your travel history visually.

3. **Natural Language Queries**: With the integration of Gemini AI, you can ask questions in plain language. For example:
   - "When did I go to Chicago?" — The app will return a list of dates you visited Chicago, which you can select to view the paths you took on those days.
   - "What did I do the day before yesterday?" — In the future, the app aims to provide detailed summaries of your activities on specific days.

4. **Future Enhancements**: The plan is to extend the capabilities of Gemini AI to answer more complex questions like:
   - "How many times did I go to the zoo?"
   - "When did I go grocery shopping?"

## Installation

To set up the project locally, you need to have `PostgreSQL`, `PostGIS`, and other dependencies installed. Follow these steps:

```bash
git clone https://github.com/yourusername/timeline-pilot.git
cd timeline-pilot
cd client && npm install && cd ..
cd server && poetry install && cd ..
make start
```

## Usage
- Upload your Google Timeline data through the provided interface.
- Use the map to explore your locations.
- Ask questions to Gemini AI to filter or highlight specific data points.