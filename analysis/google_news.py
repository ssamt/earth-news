from urllib.parse import urlencode
from tqdm import tqdm
import feedparser
from bs4 import BeautifulSoup
import re

TOPIC_URLS = {
    "World": "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB",
    "Business": "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB",
    "Technology": "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB",
    "Entertainment": "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtVnVHZ0pWVXlnQVAB",
    "Sports": "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pWVXlnQVAB",
    "Science": "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB",
    "Health": "https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtVnVLQUFQAQ"
}
SUPPORTED_LOCALES: dict[str, dict[str, str]] = {
    "US_en": {"hl": "en-US", "gl": "US", "ceid": "US:en"},
    "KR_ko": {"hl": "ko",    "gl": "KR", "ceid": "KR:ko"},
}
DEFAULT_SECTIONS = list(TOPIC_URLS.keys())

class Source:
    def __init__(self, name: str, icon_url: str = ""):
        self.name = name
        self.icon_url = icon_url

    def __str__(self):
        return self.name

    def get_json(self):
        return {'name': self.name, 'icon_url': self.icon_url}

class Article:
    def __init__(self, source: Source, title: str, url: str):
        self.source = source
        self.title = title
        self.url = url

    def __eq__(self, other):
        return self.title == other.title

    def __str__(self):
        return f'{str(self.source)}: {self.title}'

    def get_json(self):
        return {'source': self.source.get_json(), 'title': self.title}
    
    def get_clean_title(self) -> str:
        return re.sub(r'\s*-\s*[^-]+$', '', self.title).strip()

class ArticleCollection:
    def __init__(self, articles: list[Article]):
        self.articles = articles

    # Mainly for caching purposes
    # Returns whether two collections overlap, instead of whether they are equal
    # I know it's not transitive, come up with a better way if you can.
    def __eq__(self, other):
        intersection = set(self.articles) & set(other.articles)
        has_intersection = len(intersection) > 0
        return has_intersection

    def __str__(self):
        return '\n'.join(str(article) for article in self.articles)

    def get_json(self):
        return [article.get_json() for article in self.articles]
    
    
    def get_prompt_string(self) -> str:
        return '\n'.join([
            f'{i + 1}. {article.get_clean_title()}'
            for i, article in enumerate(self.articles)
        ])

def build_rss_url(base_url: str, locale: dict) -> str:
    return base_url + "?" + urlencode(locale)

def get_topic_rss_urls_by_locale(locale_key: str) -> dict[str, str]:
    locale = SUPPORTED_LOCALES[locale_key]
    return {
        section: build_rss_url(url, locale)
        for section, url in TOPIC_URLS.items()
    }

def split_articles(articles: list[Article], chunk_size: int = 10) -> list[ArticleCollection]:
    return [
        ArticleCollection(articles[i:i + chunk_size])
        for i in range(0, len(articles), chunk_size)
    ]

def parse_rss(url: str, chunk_size: int = 3) -> list[ArticleCollection]:
    feed = feedparser.parse(url, request_headers={
        "User-Agent": "Mozilla/5.0"
    })

    articles = []
    for entry in feed.entries:
        title = BeautifulSoup(entry.title, "html.parser").get_text().strip()
        link = entry.link
        source_title = entry.get("source", {}).get("title", "Unknown")
        source = Source(name=source_title, icon_url="")
        articles.append(Article(source=source, title=title, url=link))

    return split_articles(articles, chunk_size)


def get_country_collections(locale_key: str) -> dict[str, list[ArticleCollection]]:
    topic_urls = get_topic_rss_urls_by_locale(locale_key)
    return {
        section: parse_rss(url)
        for section, url in tqdm(topic_urls.items(), desc=f"[{locale_key}] Reading Sections")
    }

def get_all_article_collections_merged(sections: list[str] | None = None, locales:  list[str] | None = None) -> dict[str, list[ArticleCollection]]:
    if sections is None:
        sections = DEFAULT_SECTIONS
    if locales is None:
        locales = list(SUPPORTED_LOCALES.keys())

    merged: dict[str, list[ArticleCollection]] = {sec: [] for sec in sections}

    for loc in locales:
        try:
            sec_dict = get_country_collections(loc)
            for sec, ac_list in sec_dict.items():
                merged[sec].extend(ac_list)
        except Exception as e:
            print(f"[{loc}]: {e}")

    return merged