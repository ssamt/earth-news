export function categoryToColor(category) {
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
