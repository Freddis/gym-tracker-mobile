import {FC, useMemo} from 'react';
import {View, Pressable} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {useAppTheme} from '@/hooks/useAppTheme';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {OutdoorWalkAppEntry} from '../../../../../../types/models/AppEntry';
import {EntrySyncButton} from '../EntrySyncButton/EntrySyncButton';
import {ThemedImage} from '../../../../../blocks/ThemedImage/ThemedImage';
import MapView, {Polyline} from 'react-native-maps';
import {durationToTimeString} from '../../../../../../utils/durationToTimeString';
import {getHeatColor} from '../../../../../../utils/getHeatColor';
import {paceToString} from '../../../../../../utils/paceToString';
import {AppPathDataPoint} from '../../../../../../types/models/AppPathDataPoint';

export const OutdoorWalkBlock: FC<{entry: OutdoorWalkAppEntry, onPress?: (x: OutdoorWalkAppEntry)=> void}> = (props) => {
  const outdoorWalk = props.entry.outdoorWalk;
  const image = props.entry.image;
  const theme = useAppTheme();
  const onPress = () => {
    if (props.onPress) {
      props.onPress(props.entry);
    }
  };
  const getTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  const date = props.entry.time;
  const {time, lines, center} = useMemo(() => {
    const time = durationToTimeString(outdoorWalk.duration);
    const chunks: AppPathDataPoint[][] = [];
    let currentChunk: AppPathDataPoint[] = [];
    const chunkSize = 1000 * 60 * 1;
    let nextChunkLimit = new Date(outdoorWalk.start.getTime() + chunkSize);
    let minSpeed = 1000;
    let maxSpeed = 0;
    let minLng = 1000;
    let maxLng = -1000;
    let minLat = 1000;
    let maxLat = -1000;
    let elevationGain = 0;
    let minElevation = 1000;
    let maxElevation = -1000;
    const elevationThreshold = 0.1;
    const windowSize = 4;
    const elevationWindow: number[] = [];
    let elevationSum = 0;

    let prevSmoothed: number | null = null;
    for (const point of outdoorWalk.geoData ?? []) {
       // --- smoothing ---
      elevationWindow.push(point.altitude);
      elevationSum += point.altitude;
      if (elevationWindow.length > windowSize) {
        elevationSum -= elevationWindow.shift()!;
      }
      const smoothedElevation = elevationSum / elevationWindow.length;
      if (prevSmoothed !== null) {
        const diff = smoothedElevation - prevSmoothed;
        if (diff > elevationThreshold) {
          elevationGain += diff;
        }
      }
      prevSmoothed = smoothedElevation;
      // if (prevPoint) {
      //   const diff = point.altitude - prevPoint.altitude;
      //   if (diff > elevationThreshold) {
      //     elevationGain += diff;
      //   }
      // }
      // prevPoint = point;
      minSpeed = Math.min(minSpeed, point.speed ?? 0);
      maxSpeed = Math.max(maxSpeed, point.speed ?? 0);
      minLng = Math.min(minLng, point.longitude);
      maxLng = Math.max(maxLng, point.longitude);
      minLat = Math.min(minLat, point.latitude);
      maxLat = Math.max(maxLat, point.latitude);
      minElevation = Math.min(minElevation, point.altitude);
      maxElevation = Math.max(maxElevation, point.altitude);

      if (nextChunkLimit.getTime() - new Date(outdoorWalk.start.getTime() + point.timestamp).getTime() > 0) {
        currentChunk.push(point);
      } else {
        currentChunk.push(point);
        chunks.push(currentChunk);
        currentChunk = [];
        currentChunk.push(point);
        nextChunkLimit = new Date(outdoorWalk.start.getTime() + point.timestamp + chunkSize);
      }
    }
    chunks.push(currentChunk);
    const lines = chunks.map((chunk, i) => {
      const speed = chunk.reduce((acc, curr) => acc + (curr.speed ?? 0), 0) / chunk.length;
      const color = getHeatColor(speed, minSpeed, maxSpeed);
      // const elevationGain = chunk.reduce((acc, curr) => acc + (curr.altitude), 0) / chunk.length;
      // const color = getHeatColor(elevationGain, minElevation, maxElevation);
      return (
      <Polyline
        key={i}
        coordinates={chunk.map((x) => ({latitude: x.latitude, longitude: x.longitude}))}
        strokeColor={color}
        strokeWidth={3}
      />
      );
    });
    const center: {lat: number, lng: number} = {lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2};
    return {time, lines, center, elevationGain};
  }, [outdoorWalk]);
  return (
    <Pressable onPress={onPress}>
      <ThemedBlock style={{display: 'flex'}}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: theme.marginS}}>
          <ThemedText style={{fontSize: 16, fontWeight: 'bold', color: theme.accent, flexGrow: 1}}>Walk</ThemedText>
          <ThemedText>
            {date.toLocaleDateString()}
          </ThemedText>
        </View>
        <View style={{marginBottom: theme.marginS, flexDirection: 'row'}}>
          <View style={{flexDirection: 'column', alignItems: 'flex-start', gap: theme.marginS, flexGrow: 1}}>
            <ThemedText>Distance: {(outdoorWalk.distance / 1000).toFixed(3)} km</ThemedText>
            <ThemedText>Duration: {time}</ThemedText>
            <ThemedText>Calories: {outdoorWalk.calories.toFixed(0)}</ThemedText>
          </View>
          <View style={{alignItems: 'flex-end'}}>
            <ThemedText>
            {date.toLocaleString('en-GB', {weekday: 'long'})}, {getTime(date)}
            </ThemedText>
            <ThemedText>Pace: {paceToString(outdoorWalk.pace)} (best: {paceToString(outdoorWalk.maxPace)})</ThemedText>
            <EntrySyncButton entry={props.entry} readonly/>
          </View>
        </View>
        <View style={{flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start'}}>
          {props.entry.title && (
            <ThemedText style={{fontWeight: 'semibold'}}>
              {props.entry.title}
            </ThemedText>
          )}
          {props.entry.note && <ThemedText>{props.entry.note}</ThemedText>}
          {props.entry.image && <ThemedImage source={{uri: image?.url ?? undefined}} style={{width: '100%', height: 300, marginTop: theme.marginS}}/>}
          {props.entry.outdoorWalk.geoData && props.entry.outdoorWalk.geoData.length > 0 && (
            <View style={{width: '100%', height: 300, overflow: 'hidden', borderRadius: theme.borderRadiusM, marginTop: theme.marginS}}>
            <MapView
              style={{width: '100%', height: '100%'}}
              initialRegion={{latitude: center.lat, longitude: center.lng, latitudeDelta: 0.01, longitudeDelta: 0.01}}
            >
              {lines}
            </MapView>
          </View>
        )}
        </View>
      </ThemedBlock>
    </Pressable>
  );
};
