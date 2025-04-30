import * as R from 'ramda'
import Globe from 'react-globe.gl'

import ReactDOMServer from 'react-dom/server'

import {arrangeCircles} from './circle_arrangement'
import {PointOnSphere, CircleOnSphere} from './spherical_geometry'

function categoryToColor(category) {
    const alpha = 0.5
    const colors = {
        'U.S.': `rgba(256, 0, 0, ${alpha})`,
        'World': `rgba(0, 256, 0, ${alpha})`,
        'Business': `rgba(128, 128, 0, ${alpha})`,
        'Technology': `rgba(0, 0, 256, ${alpha})`,
        'Entertainment': `rgba(128, 0, 128, ${alpha})`,
        'Sports': `rgba(128, 256, 128, ${alpha})`,
        'Science': `rgba(0, 128, 128, ${alpha})`,
        'Health': `rgba(256, 128, 128, ${alpha})`,
    }
    if (colors.hasOwnProperty(category)) return colors[category]
    return 'gray'
}

function toLabelData(item) {
    const articleTags = item.articles.map(a => <span>{a.source.name}: {a.title}</span>)
    const labelTag = R.intersperse(<br/>, articleTags)
    const location = item.analysis.location
    const importance = item.analysis.importance
    const radius = 0.1*Math.pow(1.5, importance)
    return {
        lat: location.lat,
        lng: location.lon,
        label: ReactDOMServer.renderToStaticMarkup(labelTag),
        text: 'text',
        size: 0.5 * radius,
        radius: radius,
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
        globeImageUrl='./images/earth-blue-marble.jpg'
        backgroundImageUrl='./images/night-sky.png'

        labelsData={arrangedLabelData}
        labelLabel={'label'}
        labelSize={'size'}
        labelDotRadius={'radius'}
        labelColor={'color'}
    />
}
