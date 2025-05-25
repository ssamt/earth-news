import convert from 'color-convert'

export function categoryToColor(category) {
    // string should be in RGBA format, but we use HSL to generate colors
    const s = 60, l = 45, a = 0.8
    function colorString(h) {
        const [r, g, b] = convert.hsl.rgb([h, s, l])
        return `rgba(${r}, ${g}, ${b}, ${a})`
    }
    const colors = {
        'U.S.': colorString(0),
        'World': colorString(125),
        'Business': colorString(60),
        'Technology': colorString(230),
        'Entertainment': colorString(35),
        'Sports': colorString(275),
        'Science': colorString(175),
        'Health': colorString(320),
    }
    if (colors.hasOwnProperty(category)) return colors[category]
    return 'gray'
}
