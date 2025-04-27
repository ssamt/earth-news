import * as R from 'ramda'
import Globe from 'react-globe.gl'

function categoryToColor(category) {
    const colors = {
        'U.S.': 'blue',
        'World': 'red',
        'Business': 'green',
        'Technology': 'orange',
        'Entertainment': 'yellow',
        'Sports': 'cyan',
        'Science': 'purple',
        'Health': 'pink',
    }
    if (colors.hasOwnProperty(category)) return colors[category]
    return 'gray'
}

function toLabelData(item) {
    const location = item.analysis.location
    const importance = item.analysis.importance
    return {
        lat: location.lat,
        lng: location.lon,
        text: 'test',
        size: 1,
        radius: 0.1*Math.pow(1.5, importance),
        color: categoryToColor(item.category),
    }
}

export function GlobeScreen({analysis}) {
    const labelData = R.map(toLabelData, analysis)

    return <Globe
        globeImageUrl='./images/earth-night.jpg'
        backgroundImageUrl='./images/night-sky.png'

        labelsData={labelData}
        labelSize={'size'}
        labelDotRadius={'radius'}
        labelColor={'color'}
    />
}
