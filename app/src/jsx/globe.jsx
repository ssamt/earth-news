import * as R from 'ramda'
import Globe from 'react-globe.gl'

import {arrangeCircles} from './circle_arrangement'
import {PointOnSphere, CircleOnSphere} from './spherical_geometry'

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

function arrangeLabelDataPositions(labelData) {
    function labelToCircle(label) {
        const center = PointOnSphere.fromLatLon(label.lat, label.lng)
        const radius = label.radius * Math.PI / 180
        return new CircleOnSphere(center, radius)
    }
    const circles = labelData.map(labelToCircle)
    const arranged_circles = arrangeCircles(circles)
    const arrangedLabelData = structuredClone(labelData)
    for(let i = 0; i < arranged_circles.length; i++) {
        const { lat, lon } = arranged_circles[i].center.toLatLon()
        arrangedLabelData[i].lat = lat
        arrangedLabelData[i].lng = lon
    }
    return arrangedLabelData
}

export function GlobeScreen({analysis}) {
    const labelData = R.map(toLabelData, analysis)
    const arrangedLabelData = arrangeLabelDataPositions(labelData)

    return <Globe
        globeImageUrl='./images/earth-night.jpg'
        backgroundImageUrl='./images/night-sky.png'

        labelsData={arrangedLabelData}
        labelSize={'size'}
        labelDotRadius={'radius'}
        labelColor={'color'}
    />
}
