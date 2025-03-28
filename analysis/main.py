import json
import requests
from bs4 import BeautifulSoup

from analysis import ArticleCollectionAnalysis
from google_news import get_all_article_collections

if __name__ == '__main__':
    article_collections = get_all_article_collections(['U.S.'])
    example = article_collections['U.S.'][0]
    print(example.articles[0].url)
    analysis = ArticleCollectionAnalysis(example)
    with open('analysis.json', 'w') as f:
        json.dump(analysis.get_json(), f)
