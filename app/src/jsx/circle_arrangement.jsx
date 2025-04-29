import * as R from 'ramda'

import {CircleOnSphere} from './spherical_geometry'

// Takes a list of circles and 'push them' so that they do not overlap. Preserves the order of the circles.
// This is not a problem with a well-defined answer, but we can intuitively understand it.
// Below is one implementation.
export function arrangeCircles(circles) {
    const circles_with_indexes = circles.map((circle, index) => [circle, index])
    const sorted_circles_with_indexes = R.sort(R.descend(([c, i]) => c.radius), circles_with_indexes)
    const arranged_circles = []
    const arranged_circles_with_indexes = []
    for(const [circle, index] of sorted_circles_with_indexes) {
        try {
            const new_circle = adjustNewCircle(circle, arranged_circles)
            arranged_circles.push(new_circle)
            arranged_circles_with_indexes.push([new_circle, index])
        } catch (e) {
            console.error('Error adjusting new circle:', e)
        }
    }
    return R.sortBy(([c, i]) => i, arranged_circles_with_indexes).map(([c, i]) => c)
}

// Takes a new circle and a list of existing circles,
// and moves around the new circle minimally so that it does not overlap with any of the existing circles.
// We will only change the position of the new circle, not its radius.
// This is a solution that the author came up with, and may be incorrect.

// Let the new circle have center p and radius r,
// and let the existing circles have centers p_i and radii r_i.
// Our goal is to find a new center p' for the new circle.

// First, apply a well-known geometry trick,
// so that instead of adding a circle of radius r to the existing circles of radius r_i,
// we add a single point to circles of radius r + r_i.
// Note that these are equivalent.
// That is, we want to find the point p' which is not covered by any of the expanded circles,
// and is closest to the center of the given new circle.

// The author believes there are only three types of candidates for the point p':
// 1) p itself
// 2) for each expanded circle, the closest point to p
// 3) for each pair of expanded circles, their intersections
// This may be difficult to prove rigorously,
// but try picturing a patch of surface not covered by any of the circles,
// and it will seem intuitively correct.

// Now we take all the candidates, and check which of them are not covered by any of the existing circles.
// Then return the closest candidate to p.

// Below is the implementation.
function adjustNewCircle(new_circle, existing_circles) {
    function expandCircle(circle) {
        return new CircleOnSphere(
            circle.center,
            circle.radius + new_circle.radius
        )
    }
    const expanded_circles = existing_circles.map(expandCircle)

    const candidates = []

    // Check if a point is covered by any of the expanded circles, except for the excluded ones.
    function isCovered(point, excluded_circles=[]) {
        for(const circle of expanded_circles) {
            if (excluded_circles.includes(circle)) continue
            if (circle.hasPointInside(point)) return true
        }
        return false
    }

    // 1) p itself
    if(!isCovered(new_circle.center)) {
        return new_circle // Clearly no point is closer to p than p itself, no need for adjustment
    }

    // 2) for each expanded circle, the closest point to p
    for(const circle of expanded_circles) {
        const closest_point = circle.closestPointTo(new_circle.center)
        // Circle itself excluded due to floating point precision issues
        // That is, a point on a circle may be categorized as inside the circle, which we do not want
        if(!isCovered(closest_point, [circle])) {
            candidates.push(closest_point)
        }
    }

    // 3) for each pair of expanded circles, their intersections
    for(let i = 0; i < expanded_circles.length; i++) {
        for(let j = i + 1; j < expanded_circles.length; j++) {
            const c1 = expanded_circles[i]
            const c2 = expanded_circles[j]
            const points = c1.intersections(c2)
            const filtered_points = points.filter(p => !isCovered(p, [c1, c2]))
            candidates.push(...filtered_points)
        }
    }

    if(candidates.length === 0) {
        throw new Error('No candidates found')
    }
    const sorted_candidates = R.sortBy(p => p.angleBetween(new_circle.center), candidates)
    const closest_point = sorted_candidates[0]
    return new CircleOnSphere(closest_point, new_circle.radius)
}
