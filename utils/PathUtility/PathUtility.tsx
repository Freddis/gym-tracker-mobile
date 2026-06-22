import {Coords} from '@gabriel-sisjr/react-native-background-location';
import {PathPoint} from '../../openapi-client';
import {AppPathDataPoint} from '../../types/models/AppPathDataPoint';

export class PathUtility {

  coordsToPathPoints(locations: Coords[], start: Date): AppPathDataPoint[] {
    const startTimestamp = start.getTime();
    const result: AppPathDataPoint[] = locations.map((location) => {
      const point: AppPathDataPoint = {
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        altitude: location.altitude ?? 0,
        horizontalAccuracy: location.accuracy ?? 0,
        verticalAccuracy: location.verticalAccuracyMeters ?? 0,
        speedAccuracy: location.speedAccuracyMetersPerSecond ?? 0,
        course: location.bearing ?? 0,
        speed: location.speed ?? 0,
        distance: null,
        timestamp: location.timestamp - startTimestamp,
      };
      return point;
    });
    return result;
  }

  normalizePath(geoData: AppPathDataPoint[]): AppPathDataPoint[] {
    if (geoData.length === 0) {
      return [];
    }

    const MAX_ACCURACY = 25; // meters (tune: 25–50)
    const MAX_SPEED = 10; // m/s (~36 km/h walking buffer)
    const OUTLIER_FACTOR = 3;

    // 1. sort by time
    const points = [...geoData].sort(
      (a, b) => a.timestamp - b.timestamp
    );

    // 2. filter bad accuracy points early
    const filtered: AppPathDataPoint[] = [];
    for (const p of points) {
      if (
        p.horizontalAccuracy != null &&
        p.horizontalAccuracy > MAX_ACCURACY
      ) {
        continue;
      }
      filtered.push(p);
    }

    if (!filtered[0]) {
      return [];
    }

    const cleaned: AppPathDataPoint[] = [filtered[0]];
    // 3. outlier + speed filtering
    for (let i = 1; i < filtered.length; i++) {
      const prev = cleaned[cleaned.length - 1];
      if (!prev) {
        continue;
      }
      const curr = filtered[i];
      if (!curr) {
        continue;
      }
      const dist = this.haversine(prev, curr);
      const speed = this.computeSpeed(prev, curr, dist);

      // speed spike filter (stairs / jumps / GPS glitches)
      if (speed > MAX_SPEED) {
        continue;
      }

      // geometric outlier check (optional but very effective)
      if (cleaned.length >= 2) {
        const prevPrev = cleaned[cleaned.length - 2];
        if (!prevPrev) {
          continue;
        }
        const ab = this.haversine(prevPrev, curr);
        const ax = this.haversine(prevPrev, prev);
        const xb = dist;

        if (ax + xb > ab * OUTLIER_FACTOR) {
          // prev is likely a spike → remove it instead of adding curr
          cleaned.pop();
          continue;
        }
      }

      cleaned.push(curr);
    }

    if (cleaned.length < 2) {
      return [];
    }

    // 4. smoothing (EMA on lat/lon only)
    const alpha = 0.25;

    const smoothed: AppPathDataPoint[] = [];
    let prev = cleaned[0];
    if (!prev) {
      return [];
    }
    smoothed.push({...prev, distance: 0});

    let totalDistance = 0;

    for (let i = 1; i < cleaned.length; i++) {
      const curr = cleaned[i];
      if (!curr) {
        continue;
      }

      const smoothPoint: AppPathDataPoint = {
        ...curr,
        latitude: alpha * curr.latitude + (1 - alpha) * prev.latitude,
        longitude: alpha * curr.longitude + (1 - alpha) * prev.longitude,
      };

      const dist = this.haversine(prev, smoothPoint);
      totalDistance += dist;

      smoothed.push({
        ...smoothPoint,
        distance: totalDistance,
      });

      prev = smoothPoint;
    }
    return smoothed;
  }

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
