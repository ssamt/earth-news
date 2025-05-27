import * as R from 'ramda'
import Globe from 'react-globe.gl'

import {useMemo} from 'react'
import ReactDOMServer from 'react-dom/server'

import {arrangeCircles} from './circle_arrangement'
import {PointOnSphere, CircleOnSphere} from './spherical_geometry'
import {categoryToColor} from './color'

function toPointData(item) {
    const articleTags = item.articles.map(a => <span>{a.source.name}: {a.title}</span>)
    const labelTag = R.intersperse(<br/>, articleTags)
    const location = item.analysis.location
    const importance = item.analysis.importance
    const radius = 0.1*Math.pow(1.5, importance)
    return {
        lat: location.lat,
        lng: location.lon,
        name: ReactDOMServer.renderToStaticMarkup(labelTag),
        radius: radius,
        color: categoryToColor(item.category),
        articleCollection: item,
    }
}

function arrangePointDataPositions(pointData) {
    function pointToCircle(point) {
        const center = PointOnSphere.fromLatLon(point.lat, point.lng)
        const radius = point.radius * Math.PI / 180
        return new CircleOnSphere(center, radius)
    }
    const circles = pointData.map(pointToCircle)
    const arranged_circles = arrangeCircles(circles)
    const arrangedPointData = structuredClone(pointData)
    for(let i = 0; i < arranged_circles.length; i++) {
        const { lat, lon } = arranged_circles[i].center.toLatLon()
        arrangedPointData[i].lat = lat
        arrangedPointData[i].lng = lon
    }
    return arrangedPointData
}

export function GlobeScreen({analysis, setSelectedArticles}) {
    const pointData = useMemo(() => R.map(toPointData, analysis), [analysis])
    const arrangedPointData = useMemo(() => arrangePointDataPositions(pointData), [pointData])

    return <Globe
        globeImageUrl='./images/earth-blue-marble.jpg'
        backgroundImageUrl='./images/night-sky.png'

        pointsData={arrangedPointData}
        pointColor={'color'}
        pointAltitude={0.0025}
        pointRadius={'radius'}
        pointResolution={100}
        pointsTransitionDuration={0}
        onPointClick={ (point, _event, _coords) => {
            setSelectedArticles(point.articleCollection.articles)
        }}
    />
}
