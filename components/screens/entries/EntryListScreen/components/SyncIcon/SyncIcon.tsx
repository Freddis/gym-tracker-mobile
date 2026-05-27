import {IconSymbol} from '@/components/blocks/IconSymbol/IconSymbol';
import {useAppTheme} from '@/hooks/useAppTheme';

export const SyncIcon = (props: {object: {lastPushedAt: Date | null, updatedAt: Date | null}}) => {
  const lastSyncDate = props.object.lastPushedAt;
  const lastUpdate = props.object.updatedAt;
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
  // console.log({lastSyncDate, lastUpdate, synced});
  return (<>
    {!synced && (
        <IconSymbol name={'icloud.slash'} color={theme.accent} size={iconSize}/>
    )}
    {synced && (
      <IconSymbol name={'icloud'} color={theme.text} size={iconSize}/>
    )}
    </>
  );
};
