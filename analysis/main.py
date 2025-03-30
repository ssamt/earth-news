import json
from tqdm import tqdm

from analysis import ArticleCollectionAnalysis
from google_news import get_all_article_collections

analysis_filename = 'app/analysis.json'

def save_analysis():
    article_collections = get_all_article_collections()
    analyses = {}
    for section in article_collections.keys():
        analyses[section] = []
        for article_collection in tqdm(article_collections[section], desc=section):
            try:
                analysis = ArticleCollectionAnalysis(article_collection)
            except Exception as e:
                print(e)
                continue
            analyses[section].append(analysis.get_json())
    with open(analysis_filename, 'w') as f:
        json.dump(analyses, f)

if __name__ == '__main__':
    save_analysis()
