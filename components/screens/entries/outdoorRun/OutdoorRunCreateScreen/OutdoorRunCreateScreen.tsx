import {Stack} from 'expo-router';
import {AppScreenContainer} from '../../../../blocks/AppScreenContainer/AppScreenContainer';
import {ScrollView} from 'react-native';
import {
  Coords,
} from '@gabriel-sisjr/react-native-background-location';
import {useServices} from '../../../../providers/ServiceProvider/ServiceProvider';
import {useUser} from '../../../../providers/AuthProvider/useUser';
import {AppPathDataPoint} from '../../../../../types/models/AppPathDataPoint';
import {RouteTrackingScreen} from '../../../common/RouteTrackingScreen/RouteTrackingScreen';

export const OutdoorRunCreateScreen = () => {
  const {outdoorRunService, entryListService} = useServices();
  const user = useUser();

  const stopWalk = async (start: Date, stop: Date, locations: Coords[]): Promise<AppPathDataPoint[]> => {
    const entry = await outdoorRunService.createEntry(user, start, stop, locations);
    entryListService.addEntry(entry);
    return entry.outdoorRun.geoData ?? [];
  };

  return (
    <AppScreenContainer>
      <Stack.Screen options={{title: 'Outdoor Run'}} />
      <ScrollView className="h-full">
        <RouteTrackingScreen onStop={stopWalk} />
      </ScrollView>
    </AppScreenContainer>
  );
};
