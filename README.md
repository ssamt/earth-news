## Structure
 - `analysis/`: Python code for live news scraping and LLM analysis.
 - `server/`: Simple Flask web server.
 - `app/`: Frontend React application.

## Setup
(not tested)
1. Clone repository
```
git clone https://github.com/ssamt/earth-news.git
```
2. Install dependencies
```
pip install -r requirements.txt
cd app
npm install
```
3. Build React app
```
npm run build
```
4. Run server
```
cd ..
flask --app server/server run
```
