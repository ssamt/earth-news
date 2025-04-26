import * as R from 'ramda'
import Globe from 'react-globe.gl'

function isValidAnalysis(d) {
    const analysis = d.analysis
    const location = analysis.location
    if (location.lat === null || location.lon === null) return false
    if (analysis.importance === null) return false
    if (location.lat === 0 && location.lon === 0) return false // likely not a real location
    return true
}

function toLabelData(d) {
    const location = d.analysis.location
    const importance = d.analysis.importance
    return {
        lat: location.lat,
        lng: location.lon,
        text: 'test',
        size: 1,
        radius: 0.1*Math.pow(1.5, importance),

    }
}

export function GlobeScreen({analysis}) {
    const fullData = R.flatten(R.values(analysis))
    const data = R.filter(isValidAnalysis, fullData)
    const labelData = R.map(toLabelData, data)

    return <Globe
        globeImageUrl='//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg'
        backgroundImageUrl='//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png'

        labelsData={labelData}
        labelSize={'size'}
        labelDotRadius={'radius'}
    />
}
