import {PathPoint} from '../../openapi-client';
import {AppPathDataPoint} from '../../types/models/AppPathDataPoint';

export class PathUtility {

  toPathPoint(point: AppPathDataPoint): PathPoint {
    return [
      point.latitude,
      point.longitude,
      point.altitude,
      point.timestamp,
      point.speed,
      point.distance,
      point.course,
      point.horizontalAccuracy,
      point.verticalAccuracy,
      point.speedAccuracy,
    ];
  }

  fromPathPoint(point: PathPoint): AppPathDataPoint {
    return {
      latitude: point[0],
      longitude: point[1],
      altitude: point[2],
      timestamp: point[3],
      speed: point[4],
      distance: point[5],
      course: point[6],
      speedAccuracy: point[7],
      horizontalAccuracy: point[8],
      verticalAccuracy: point[9],
    };
  }
  totalDistance(points: AppPathDataPoint[]): number {
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

  haversine(a: AppPathDataPoint, b: AppPathDataPoint): number {
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

  computeSpeed(
    a: AppPathDataPoint,
    b: AppPathDataPoint,
    dist: number
  ): number {
    const dt = (b.timestamp - a.timestamp) / 1000;
    if (dt <= 0) return Infinity;
    return dist / dt;
  }
}
