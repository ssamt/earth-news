// This code is not meant to be mathematically rigorous, but just something that works for our purposes
// All operations on sphere is done on the unit sphere, that is, radius 1
// All angles are in radians
// (Latitude and Longitude are in degrees, as they are not quite just angles)

import * as R from 'ramda'

const eps = 1e-6
function closeToZero(x) {
    return Math.abs(x) < eps
}

// A 3d vector, also used to represent points
class Vector {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }

    add(vector) {
        return new Vector(
            this.x + vector.x,
            this.y + vector.y,
            this.z + vector.z
        )
    }

    multiply(scalar) {
        return new Vector(
            this.x * scalar,
            this.y * scalar,
            this.z * scalar
        )
    }

    norm() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    }

    normalized() {
        const len = this.norm()
        if(closeToZero(len)) {
            throw new Error('Vector is zero')
        }
        return new Vector(this.x / len, this.y / len, this.z / len)
    }

    dotProduct(vector) {
        return this.x * vector.x + this.y * vector.y + this.z * vector.z
    }

    crossProduct(vector) {
        return new Vector(
            this.y * vector.z - this.z * vector.y,
            this.z * vector.x - this.x * vector.z,
            this.x * vector.y - this.y * vector.x
        )
    }
}

// Plane represented by normal vector and the inner product with it, that is, n*p = d
class Plane {
    constructor(n, d) {
        this.n = n
        this.d = d
    }

    static fromCircle(circle) {
        const n = circle.center.p
        const d = Math.cos(circle.radius)

        return new Plane(n, d)
    }

    // Mathematically, the intersection can be 1) a line 2) a plane 3) nothing.
    // For our purposes, we can ignore 2) and 3).
    // We handle them by just throwing an error.
    intersection(plane) {
        const n1 = this.n
        const n2 = plane.n
        const d1 = this.d
        const d2 = plane.d

        // The direction of the line is given by the cross product of the two normals
        const dp = n1.crossProduct(n2)

        let x, y, z
        // Now we need to find a point on the line
        if(!closeToZero(dp.x)) {
            // If the direction has a non-zero x component, it must have a point where x = 0
            // Rest is just solving a linear system of two equations
            x = 0
            y = (d1 * n2.z - d2 * n1.z) / (n1.y * n2.z - n2.y * n1.z)
            z = (d1 * n2.y - d2 * n1.y) / (n1.z * n2.y - n2.z * n1.y)
        } else if(!closeToZero(dp.y)) {
            x = (d1 * n2.z - d2 * n1.z) / (n1.x * n2.z - n2.x * n1.z)
            y = 0
            z = (d1 * n2.x - d2 * n1.x) / (n1.z * n2.x - n2.z * n1.x)
        } else if(!closeToZero(dp.z)) {
            x = (d1 * n2.y - d2 * n1.y) / (n1.x * n2.y - n2.x * n1.y)
            y = (d1 * n2.x - d2 * n1.x) / (n1.y * n2.x - n2.y * n1.x)
            z = 0
        } else {
            throw new Error('Planes are parallel')
        }
        const p0 = new Vector(x, y, z)
        return new Line(p0, dp)
    }
}

// Line parametrized by t
// p(t) = p0 + t * dp
class Line {
    constructor(p0, dp) {
        this.p0 = p0
        this.dp = dp
    }

    pointAt(t) {
        return this.p0.add(this.dp.multiply(t))
    }

    // Return a list of points where the line intersects the sphere
    intersectionsWithSphere() {
        // Solve the quadratic equation |p0 + t * dp|^2 = 1  =>  a*t^2 + b*t + c = 0
        const a = this.dp.dotProduct(this.dp)
        const b = 2 * this.p0.dotProduct(this.dp)
        const c = this.p0.dotProduct(this.p0) - 1

        const discriminant = b * b - 4 * a * c
        let ts
        // Handling discriminant == 0 case separately is not only unnecessary, it will often be incorrect,
        // because discriminant consists of squares of coefficients,
        // thus it can have small meaningful positive values.
        if (discriminant < 0) {
            ts = []
        } else {
            const t1 = (-b + Math.sqrt(discriminant)) / (2 * a)
            const t2 = (-b - Math.sqrt(discriminant)) / (2 * a)
            ts = [t1, t2]
        }
        const vectors = ts.map(t => this.pointAt(t))
        const points = vectors.map(v => new PointOnSphere(v))
        return points
    }
}

// Point on the sphere represented by cartesian coordinates
export class PointOnSphere {
    constructor(v) {
        this.p = v.normalized()
    }

    static fromCartesian(x, y, z) {
        const v = new Vector(x, y, z)
        return new PointOnSphere(v)
    }

    static fromLatLon(lat, lon) {
        const phi = lon * Math.PI / 180
        const theta = Math.PI / 2 - (lat * Math.PI / 180)

        return PointOnSphere.fromCartesian(
            Math.sin(theta) * Math.cos(phi),
            Math.sin(theta) * Math.sin(phi),
            Math.cos(theta)
        )
    }
    toLatLon() {
        const theta = Math.acos(this.p.z)
        const phi = Math.atan2(this.p.y, this.p.x)

        const lat = 90 - theta * 180 / Math.PI
        const lon = phi * 180 / Math.PI
        return { lat: lat, lon: lon }
    }

    orthogonalPointToBoth(point) {
        const cross = this.p.crossProduct(point.p)
        try {
            const point = new PointOnSphere(cross)
            return point
        } catch(e) {
            // cross product is zero, that is, the two points are the same or the opposite
            // just choose whatever point orthogonal to itself, just be careful not to make it zero
            if(!closeToZero(this.p.x)) {
                const v = new Vector(this.p.y, -this.p.x, 0)
                return new PointOnSphere(v)
            } else {
                const v = new Vector(0, this.p.z, -this.p.y)
                return new PointOnSphere(v)
            }
        }
    }

    angleBetween(point) {
        const cos_angle = R.clamp(-1, 1, this.p.dotProduct(point.p))
        return Math.acos(cos_angle)
    }

    greatCircleCrossing(point) {
        const center = this.orthogonalPointToBoth(point)
        return new CircleOnSphere(center, Math.PI / 2)
    }
}

// Circle on the sphere represented by a center on the sphere and a radius by the angle
// (The boundary of a circle, not the interior, in case it is not clear)
export class CircleOnSphere {
    constructor(center, radius) {
        this.center = center
        this.radius = radius
    }

    hasPointInside(point) {
        return this.center.angleBetween(point) < this.radius
    }

    intersections(circle) {
        const plane1 = Plane.fromCircle(this)
        const plane2 = Plane.fromCircle(circle)

        try {
            const line = plane1.intersection(plane2)
            return line.intersectionsWithSphere()
        } catch (e) {
            // Planes are parallel
            // If the circles are not the same, they do not intersect.
            // If they are the same, we don't need to handle its intersections anyway.
            return []
        }
    }

    closestPointTo(point) {
        const greatCircle = this.center.greatCircleCrossing(point)
        const points = this.intersections(greatCircle)
        R.sortBy(p => p.angleBetween(point), points)
        if(points.length === 0) {
            // This should not occur
            throw new Error('No intersection between circle and great circle')
        }
        return points[0]
    }
}
