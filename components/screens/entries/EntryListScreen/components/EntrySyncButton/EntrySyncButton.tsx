import {IconSymbol} from '@/components/blocks/IconSymbol/IconSymbol';
import {useAppTheme} from '@/hooks/useAppTheme';
import {useEffect, useState} from 'react';
import {Pressable} from 'react-native';
import {AppEntry} from '../../../../../../types/models/AppEntry';
import {useEntryService} from '../../../../../../utils/EntryService/useEntryService';


export const EntrySyncButton = (props: {entry: AppEntry, readonly?: boolean}) => {
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
  const [synced, setSynced] = useState(considerSynced);
  useEffect(() => {
    if (synced === considerSynced) {
      return;
    }
    setSynced(considerSynced);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [considerSynced]);
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
    alert(msg);
    setSynced(result);
  };
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
