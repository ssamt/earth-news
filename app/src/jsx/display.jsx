import * as R from 'ramda'

import {useEffect, useMemo, useState} from 'react'

import {GlobeScreen} from './globe'
import {LeftSidebar, RightSidebar} from './sidebar'

function isValidAnalysis(item) {
    const analysis = item.analysis
    const location = analysis.location
    if (location.lat === null || location.lon === null) return false
    if (analysis.importance === null) return false
    if (location.lat === 0 && location.lon === 0) return false // likely not a real location
    return true
}

function preprocessAnalysisData(analysis)  {
    const result = []
    for(const category in analysis) {
        for(const item of analysis[category]) {
            if (!isValidAnalysis(item)) continue
            item.category = category
            result.push(item)
        }
    }
    return result
}

function searchQueryArticle(article, query) {
    const lowerQuery = query.toLowerCase()
    return article.title.toLowerCase().includes(lowerQuery) ||
           article.source.name.toLowerCase().includes(lowerQuery)
}
function searchQueryArticleCollection(articleCollection, query) {
    return articleCollection.articles.some(article => searchQueryArticle(article, query))
}

export function App() {
    const [analysis, setAnalysis] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [showCategories, setShowCategories] = useState({})
    const [selectedArticles, setSelectedArticles] = useState([])

    const filteredAnalysis = useMemo(() => {
        const searchFiltered = analysis.filter(articleCollection => searchQueryArticleCollection(articleCollection, searchQuery))
        const categoryFiltered =  searchFiltered.filter(articleCollection => showCategories[articleCollection.category])
        return categoryFiltered
    }, [analysis, searchQuery, showCategories])

    useEffect(() => {
        const file_url = './dynamic/analysis.json'
        fetch(file_url)
            .then(response => response.json())
            .then(preprocessAnalysisData)
            .then(data => {
                setAnalysis(data)
                const categories = R.uniq(data.map(item => item.category))
                const initialShowCategories = R.zipObj(categories, Array(categories.length).fill(true))
                setShowCategories(initialShowCategories)
            })
            .catch(error => console.error('Error fetching analysis:', error))
    }, [])

    return <div>
        <GlobeScreen analysis={filteredAnalysis} setSelectedArticles={setSelectedArticles}/>
        <LeftSidebar searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                     showCategories={showCategories} setShowCategories={setShowCategories}/>
        <RightSidebar selectedArticles={selectedArticles}/>
    </div>
}
