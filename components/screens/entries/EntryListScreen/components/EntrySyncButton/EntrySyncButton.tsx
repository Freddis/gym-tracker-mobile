import {IconSymbol} from '@/components/blocks/IconSymbol/IconSymbol';
import {useAppTheme} from '@/hooks/useAppTheme';
import {Pressable} from 'react-native';
import {AppEntry} from '../../../../../../types/models/AppEntry';
import {useServices} from '../../../../../providers/ServiceProvider/ServiceProvider';

export const EntrySyncButton = (props: {entry: AppEntry, readonly?: boolean, onUpdate: (entry: AppEntry) => void}) => {
  const {entryService} = useServices();
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
  const synced = considerSynced;
  const sync = async () => {
    const entry = await entryService.getEntry(props.entry.id);
    const result = await entryService.pushEntry(entry);
    const successMessage = 'Successfully synced';
    const errorMessage = 'Something went wrong';
    const msg = result ? successMessage : errorMessage;
    if (props.onUpdate) {
      const updatedEntry = await entryService.getEntry(props.entry.id);
      props.onUpdate(updatedEntry);
    }
    alert(msg);
  };
  // console.log({lastSyncDate, lastUpdate, synced});
  return (<>
    {!synced && (
      <Pressable onPress={sync} disabled={false}>
        <IconSymbol name={'icloud.slash'} color={theme.accent} style={{bottom: -3}} size={iconSize}/>
      </Pressable>
  )}
    {synced && (
      <Pressable onPress={sync} disabled={false}>
        <IconSymbol name={'icloud'} color={theme.text} size={iconSize}/>
      </Pressable>
  )}
    </>
  );
};
