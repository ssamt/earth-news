from urllib.parse import urljoin
import requests

from bs4 import BeautifulSoup

base_url = 'https://news.google.com/'
all_sections = ['U.S.', 'World', 'Business', 'Technology', 'Entertainment', 'Sports', 'Science', 'Health']

class Article:
    def __init__(self, title, url):
        self.title = title
        self.url = url

    def __eq__(self, other):
        return self.title == other.title

    def __str__(self):
        return f'{self.title}: ({self.url})'

    def get_json(self):
        return {'title': self.title, 'url': self.url}

class ArticleCollection:
    def __init__(self, articles):
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

    def get_prompt_string(self):
        return '\n'.join([
            f'{i + 1}. {article.title}'
            for i, article in enumerate(self.articles)
        ])

def get_sections_urls(sections):
    page = requests.get(base_url)
    soup = BeautifulSoup(page.content, 'html.parser')
    menubar = soup.find(role='menubar')
    anchors = {section: menubar.find(attrs={'aria-label': section}) for section in sections}
    urls = {section: urljoin(base_url, anchor['href']) for section, anchor in anchors.items()}
    return urls

def get_section_article_collections(url):
    page = requests.get(url)
    soup = BeautifulSoup(page.content, 'html.parser')
    article_tags = soup.find_all('article')

    def is_article_collection_tag(tag):
        child_articles = tag.find_all('article', recursive=False)
        all_articles = tag.find_all('article')
        return len(child_articles) == 1 and len(all_articles) > 1

    def get_article_from_article_tag(tag):
        anchor = tag.find('a', string=True)
        return Article(title=anchor.text, url=urljoin(url, anchor['href']))

    article_parent_tags = [tag.parent for tag in article_tags]
    article_collection_tags = [tag for tag in article_parent_tags if is_article_collection_tag(tag)]
    print(len(article_collection_tags))
    article_collections = [
        ArticleCollection([
            get_article_from_article_tag(article_tag)
            for article_tag in article_collection_tag.find_all('article')
        ])
        for article_collection_tag in article_collection_tags
    ]
    return article_collections

def get_all_article_collections(sections=None):
    if sections is None:
        sections = all_sections
    urls = get_sections_urls(sections)
    news_collections = {section: get_section_article_collections(url) for section, url in urls.items()}
    return news_collections

if __name__ == '__main__':
    all_article_collections = get_all_article_collections()
    for article_collections in all_article_collections.values():
        for article_collection in article_collections:
            print(article_collection)
            print()
