import {IconSymbol} from '@/components/blocks/IconSymbol/IconSymbol';
import {useAppTheme} from '@/hooks/useAppTheme';
import {Pressable} from 'react-native';
import {AppEntry} from '../../../../../../types/models/AppEntry';
import {useEntryService} from '../../../../../../utils/EntryService/useEntryService';


export const EntrySyncButton = (props: {entry: AppEntry, readonly?: boolean, onUpdate: (entry: AppEntry) => void}) => {
  // const lastSyncDate = props.workout.lastPulledAt ?? props.workout.lastPushedAt
  const lastSyncDate = props.entry.lastPushedAt;
  const lastUpdate = props.entry.updatedAt;
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
  // console.log('considerSynced', {considerSynced, lastSyncDate, lastUpdate});
  const synced = considerSynced;
  // useEffect(() => {
  //   console.log('effect', {entry: props.entry});
  //   if (synced === considerSynced) {
  //     return;
  //   }
  //   setSynced(considerSynced);
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [considerSynced, props.entry.updatedAt]);
  const [service] = useEntryService();
  const sync = async () => {
    // if (props.readonly) {
    //   return;
    // }
    const entry = await service.getEntry(props.entry.id);
    const result = await service.pushEntry(entry);
    const successMessage = 'Successfully synced';
    const errorMessage = 'Something went wrong';
    const msg = result ? successMessage : errorMessage;
    if (props.onUpdate) {
      const updatedEntry = await service.getEntry(props.entry.id);
      props.onUpdate(updatedEntry);
    }
    alert(msg);
    // setSynced(result);
  };
  // console.log({lastSyncDate, lastUpdate, synced});
  return (<>
    {!synced && (
      <Pressable onPress={sync} disabled={false}>
      {!props.readonly && <IconSymbol name={'icloud.and.arrow.up'} color={theme.accent} style={{bottom: -3}} size={iconSize}/>}
      {props.readonly && <IconSymbol name={'icloud'} color={theme.accent} style={{bottom: -3}} size={iconSize}/>}
    </Pressable>
  )}
    {synced && (
      <Pressable onPress={sync} disabled={false}>
      {!props.readonly && <IconSymbol name={'arrow.counterclockwise.icloud.fill'} color={theme.accent} size={iconSize}/>}
      {props.readonly && <IconSymbol name={'icloud.fill'} color={theme.accent} size={iconSize}/>}
    </Pressable>
  )}
    </>
  );
};
