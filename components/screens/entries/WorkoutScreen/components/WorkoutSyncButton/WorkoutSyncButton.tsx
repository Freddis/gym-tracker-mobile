import {IconSymbol} from '@/components/blocks/IconSymbol/IconSymbol';
import {useAppTheme} from '@/hooks/useAppTheme';
import {CompleteAppWorkout} from '@/types/models/AppWorkout';
import {useDrizzle} from '@/utils/drizzle';
import {useWorkoutService} from '@/utils/WorkoutService/useWorkoutService';
import {useEffect, useState} from 'react';
import {Pressable} from 'react-native';


export const WorkoutSyncButton = (props: {workout: CompleteAppWorkout, readonly?: boolean}) => {
  // const lastSyncDate = props.workout.lastPulledAt ?? props.workout.lastPushedAt
  const lastSyncDate = props.workout.lastPushedAt;
  const lastUpdate = props.workout.updatedAt;
  const theme = useAppTheme();
  const iconSize = 25;
  const considerSynced = (() => {
    if (!lastSyncDate) {
      return false;
    }
    if (!lastUpdate) {
      return true;
    }
    const synced = lastSyncDate.getTime() > lastUpdate.getTime();
    return synced;
  })();
  const [synced, setSynced] = useState(considerSynced);
  useEffect(() => {
    if (synced === considerSynced) {
      return;
    }
    setSynced(considerSynced);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [considerSynced]);
  const [service] = useWorkoutService();
  const [db] = useDrizzle();
  const sync = async () => {
    if (props.readonly) {
      return;
    }
    const result = await service.pushWorkout(db, props.workout);
    const successMessage = 'Successfully synced';
    const errorMessage = 'Something went wrong';
    const msg = result ? successMessage : errorMessage;
    alert(msg);
    setSynced(result);
  };
  return (<>
    {!synced && (
      <Pressable onPress={sync} disabled={props.readonly}>
      {!props.readonly && <IconSymbol name={'icloud.and.arrow.up'} color={theme.accent} style={{bottom: -3}} size={iconSize}/>}
      {props.readonly && <IconSymbol name={'icloud'} color={theme.accent} style={{bottom: -3}} size={iconSize}/>}
    </Pressable>
  )}
    {synced && (
      <Pressable onPress={sync} disabled={props.readonly}>
      {!props.readonly && <IconSymbol name={'arrow.counterclockwise.icloud.fill'} color={theme.accent} size={iconSize}/>}
      {props.readonly && <IconSymbol name={'icloud.fill'} color={theme.accent} size={iconSize}/>}
    </Pressable>
  )}
    </>
  );
};
