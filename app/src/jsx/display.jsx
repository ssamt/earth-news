import {useEffect, useState} from 'react'

import {GlobeScreen} from './globe'
import {RightSidebar} from './sidebar'

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

export function App() {
    const [selectedArticles, setSelectedArticles] = useState([])
    const [analysis, setAnalysis] = useState([])

    useEffect(() => {
        const file_url = './dynamic/analysis.json'
        fetch(file_url)
            .then(response => response.json())
            .then(preprocessAnalysisData)
            .then(data => setAnalysis(data))
            .catch(error => console.error('Error fetching analysis:', error))
    }, [])

    return <div>
        <GlobeScreen analysis={analysis} setSelectedArticles={setSelectedArticles}/>
        <RightSidebar selectedArticles={selectedArticles}/>
    </div>
}
