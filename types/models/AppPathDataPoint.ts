export interface AppPathDataPoint {
  timestamp: number;
  latitude: number;
  longitude: number;
  altitude: number;
  course: number | null;
  speed: number | null;
  speedAccuracy: number | null;
  horizontalAccuracy: number | null;
  verticalAccuracy: number | null;
  distance: number | null;
}
