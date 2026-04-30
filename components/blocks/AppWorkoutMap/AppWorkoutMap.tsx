import {FC, useMemo} from 'react';
import MapView, {Polyline} from 'react-native-maps';
import {getHeatColor} from '../../../utils/getHeatColor';
import {ProcessedPathData} from '../../../utils/usePathDataProcessing';

interface AppWorkoutMapProps {
  data: ProcessedPathData;
}
export const AppWorkoutMap: FC<AppWorkoutMapProps> = (props) => {
  const {lines, center, latitudeDelta, longitudeDelta} = useMemo(() => {
    const {minSpeed, maxSpeed, bounds} = props.data;
    const lines = props.data.chunks.map((chunk, i) => {
      const speed = chunk.reduce((acc, curr) => acc + (curr.speed ?? 0), 0) / chunk.length;
      const color = getHeatColor(speed, minSpeed, maxSpeed);
      return (
      <Polyline
        key={i}
        coordinates={chunk.map((x) => ({latitude: x.latitude, longitude: x.longitude}))}
        strokeColor={color}
        strokeWidth={3}
      />
      );
    });
    const center: {lat: number, lng: number} = {lat: (bounds.north + bounds.south) / 2, lng: (bounds.east + bounds.west) / 2};
    const latitudeDelta = (bounds.north - bounds.south) * 1.1;
    const longitudeDelta = (bounds.east - bounds.west) * 1.1;
    return {lines, center, latitudeDelta, longitudeDelta};
  }, [props.data]);
  return (
    <MapView
      style={{width: '100%', height: '100%'}}
      initialRegion={{latitude: center.lat, longitude: center.lng, latitudeDelta, longitudeDelta}}
    >
      {lines}
    </MapView>
  );
};
