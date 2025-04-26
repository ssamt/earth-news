import { GlobeScreen } from './globe'
import {useEffect, useState} from 'react'

export function App() {
    const [analysis, setAnalysis] = useState({})

    useEffect(() => {
        const file_url = './analysis.json'
        fetch(file_url)
            .then(response => response.json())
            .then(data => setAnalysis(data))
            .catch(error => console.error('Error fetching analysis:', error))
    }, [])

    return <div>
        <GlobeScreen analysis={analysis}/>
    </div>
}
