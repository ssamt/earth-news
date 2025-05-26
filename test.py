import requests
import feedparser

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
            f'{i + 1}. {article.title}'
            for i, article in enumerate(self.articles)
        ])

def parse_rss(url: str) -> list[ArticleCollection]:
    feed = feedparser.parse(url)
    articles = []
    for entry in feed.entries:
        title = entry.title
        link = entry.link
        source_title = entry.get("source", {}).get("title", "Unknown")
        source = Source(name=source_title)
        articles.append(Article(source=source, title=title, url=link))
        print(entry)
    return [ArticleCollection(articles)] if articles else []

rss_url = "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB?hl=ko&gl=KR&ceid=KR:ko"
print(parse_rss(rss_url))
