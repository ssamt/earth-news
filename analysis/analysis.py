import os
import json

from dotenv import load_dotenv
from google import genai

from google_news import ArticleCollection

load_dotenv()

client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))

class ArticleCollectionAnalysis:
    def __init__(self, article_collection: ArticleCollection):
        self.article_collection = article_collection
        self.analysis = get_analysis(article_collection)

    def __str__(self):
        return f'''{str(self.article_collection)}

Location: {str(self.analysis['location'])}'''

    def get_json(self):
        return {
            'articles': self.article_collection.get_json(),
            'location': self.analysis['location'].get_json(),
        }

class Location:
    def __init__(self, lat, lon):
        self.lat = lat
        self.lon = lon

    def __str__(self):
        return f'{self.lat}, {self.lon}'

    def get_json(self):
        return {'lat': self.lat, 'lon': self.lon}

def get_json(response: str):
    start_idx = response.find('{')
    end_idx = response.rfind('}')
    return json.loads(response[start_idx:end_idx+1])

def get_location(article_collection: ArticleCollection) -> Location:
    query = f'''Given a list of news articles, return a location in longitude and latitude.
Think step by step, and at the end of the response, return the location in longitude and latitude in JSON format, e.g. {{"lat": 37.7749, "lon": -122.4194}}

{article_collection.get_prompt_string()}'''

    response = client.models.generate_content(
        model='gemini-2.0-flash-lite',
        contents=query,
    )
    answer = get_json(response.text)
    return Location(answer['lat'], answer['lon'])

def get_analysis(article_collection: ArticleCollection):
    location = get_location(article_collection)
    return {'location': location}
