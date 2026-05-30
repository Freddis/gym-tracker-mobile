import {PathPoint} from '../../openapi-client';

export class PathUtility {
  totalDistance(points: PathPoint[]): number {
    if (points.length < 2) {
      return 0;
    }

    let sum = 0;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const current = points[i];
      if (!prev || !current) {
        continue;
      }
      sum += this.haversine(prev, current);
    }
    return sum;
  }

  protected toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  protected haversine(a: PathPoint, b: PathPoint): number {
    const R = 6371000; // Earth radius in meters

    const dLat = this.toRad(b.latitude - a.latitude);
    const dLng = this.toRad(b.longitude - a.longitude);

    const lat1 = this.toRad(a.latitude);
    const lat2 = this.toRad(b.latitude);

    const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(h));
  }
}
