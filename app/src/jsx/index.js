function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
}

function windowPosition({lat, lon}) {
    const latMin = -90, latMax = 90
    const lonMin = -180, lonMax = 180
    const x = window.innerWidth * (lon - lonMin) / (lonMax - lonMin)
    const y = window.innerHeight * (1 - (lat - latMin) / (latMax - latMin)) // minus because y-axis is inverted in window
    return {x, y}
}

function getCircle({ articles, analysis }) {
    const { location, importance } = analysis
    const radius = 10 * (Math.pow(1.4, importance) - 1)
    const { x, y } = windowPosition(location)
    const clamped_x = clamp(x, radius, window.innerWidth - radius)
    const clamped_y = clamp(y, radius, window.innerHeight - radius)
    const tag = document.createElement('div')
    tag.className = 'circle'
    tag.style.width = `${radius}px`
    tag.style.height = `${radius}px`
    tag.style.left = `${clamped_x}px`
    tag.style.top = `${clamped_y}px`
    return tag
}

async function main() {
    const root = document.getElementById('root')

    const response = await fetch('app/analysis.json')
    const analysis = await response.json()
    console.log(analysis)

    for(const section of Object.keys(analysis)) {
        for(const articles in analysis[section]) {
            const tag = getCircle(analysis[section][articles])
            root.appendChild(tag)
        }
    }
}

main()
