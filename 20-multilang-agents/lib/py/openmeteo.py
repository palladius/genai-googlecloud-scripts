
import requests
#import vertexai
import json
from vertexai.generative_models import (
    Content,
    FunctionDeclaration,
    GenerativeModel,
    GenerationConfig,
    Part,
    Tool,
)


def get_location_data(location_name):
    """Retrieves location data from the Open-Meteo Geocoding API.

    This function takes a location name as input and returns
    a JSON object containing location data from the Open-Meteo API.

    Args:
    location_name: The name of the location to search for. eg. "Argenta, Italy"

    Returns:
    A JSON object containing location data.
    """

    location_url = f"https://geocoding-api.open-meteo.com/v1/search?name={location_name}&count=10&language=en&format=json"
    response = requests.get(location_url)
    response_json = json.loads(response.text)
    return response_json # ['results'][0]
    #  return response_json


def get_weather_forecast(latitude, longitude, timezone = "Europe/Berlin", forecast_days = 3):
    """Retrieves weather forecast data from the Open-Meteo Weather API.

    This function takes latitude, longitude, timezone, and forecast days as input,
    and returns a json object containing the weather forecast data.

    Args:
        latitude: The latitude of the location.
        longitude: The longitude of the location.
        timezone: The timezone of the location (default: "Europe/Berlin").
        forecast_days: The number of forecast days (default: 3).

    Returns:
        A Json object containing the weather forecast data.
    """
    import pandas as pd

    weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&hourly=temperature_2m&timezone={timezone}&forecast_days={forecast_days}"
    response = requests.get(weather_url)
    response_json = json.loads(response.text)

    # Basic Transformation of results
    df = pd.DataFrame()
    df["DateTime"] = response_json["hourly"]["time"]
    df["Temperature"] = response_json["hourly"]["temperature_2m"]

    # px.line(df, x="DateTime", y="Temperatura")
    return df.to_json(orient="records")


get_location_data_func = FunctionDeclaration(
    name="get_location_data",
    description="Get latitude, longitude and population of a particular location (in English).",
    parameters={
        "type": "object",
        "properties": {
            "location_name": {
                "type": "string",
                "description": "Name of a country or city. If available provide: 'City, Country', always IN ENGLISH."
            },
        },
        "required": [
                "location_name"
        ]
    },
)



# Function Declaration for get_weather_forecast

get_weather_forecast_func = FunctionDeclaration(
    name="get_weather_forecast",
    description="Provide the hourly forecasting of weather for a particular place based on latitude and longitude",
    parameters={
        "type": "object",
        "properties": {
            "latitude": {
                "type": "string",
                "description": "Latitude of the location desired, this can come from get_location_data function."
            },
            "longitude": {
                "type": "string",
                "description": "Longitude of the location desired, this can come from get_location_data function."
            },
            "timezone": {
                "type": "string",
                "description": "Timezone for the hourly forecast in format similar to: America/La_Paz, If not specified, this can come from get_location_data function."
            },
            "forecast_days": {
                "type": "string",
                "description": "Amount of days to forecast weather"
            },
        },
        "required": [
                "latitude", "longitude"
        ]
    },
)


def test_open_meteo_apis():
    print(get_location_data("Bologna"))
    print(get_location_data("La Paz, Bolivia"))
    print(get_weather_forecast(latitude = "-16.5", longitude="-68.15")) # La Paz
