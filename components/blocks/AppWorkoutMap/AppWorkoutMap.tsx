import {FC, useEffect, useMemo, useState} from 'react';
import MapView, {Polyline} from 'react-native-maps';
import {View} from 'react-native';
import {getHeatColor} from '../../../utils/getHeatColor';
import {ProcessedPathData} from '../../../utils/usePathDataProcessing';
import {VisibilitySensor} from '@futurejj/react-native-visibility-sensor';
interface AppWorkoutMapProps {
  data: ProcessedPathData;
}
export const AppWorkoutMap: FC<AppWorkoutMapProps> = (props) => {
  const RENDER_DELAY = 350;
  const [percentVisible, setPercentVisible] = useState<number>(0);
  const [isRendered, setIsRendered] = useState(false);
  const isVisible = percentVisible > 80;
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

  // rendering only when map is visible, aiming to render 1 at time and skip on fast scrolls
  useEffect(() => {
    // already done → do nothing forever
    if (isRendered) {
      return;
    };

    // not visible → nothing to schedule
    if (!isVisible) {
      return;
    };

    const id = setTimeout(() => {
      // re-check at execution time
      if (isVisible) {
        setIsRendered(true);
      }
    }, RENDER_DELAY);

    return () => clearTimeout(id);
  }, [isVisible, isRendered]);
  // console.log('render map', isVisible, isRendered);
  return (
    <VisibilitySensor onPercentChange={(change) => setPercentVisible(change)} onChange={() => {}}>
    {!isRendered && (
     <View className="w-full h-full bg-slate-900/40"/>
    )}
    {isRendered && (
      <MapView style={{width: '100%', height: '100%'}} initialRegion={{latitude: center.lat, longitude: center.lng, latitudeDelta, longitudeDelta}}>
      {lines}
    </MapView>
    )}
    </VisibilitySensor>
  );
};
