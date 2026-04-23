import {FC} from 'react';
import {View, Pressable} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {useAppTheme} from '@/hooks/useAppTheme';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {AppEntry} from '../../../../../../types/models/AppEntry';
import {EntrySyncButton} from '../EntrySyncButton/EntrySyncButton';

export const UknownEntryBlock: FC<{entry: AppEntry}> = (props) => {
  const theme = useAppTheme();
  const getTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  const date = props.entry.time;
  return (
    <Pressable>
      <ThemedBlock style={{display: 'flex'}}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: theme.marginS}}>
          <ThemedText style={{fontSize: 16, fontWeight: 'bold', color: theme.accent, flexGrow: 1}}>Unknown</ThemedText>
          <ThemedText>
            {date.toLocaleDateString()}
          </ThemedText>
        </View>
        <View style={{marginBottom: theme.marginM, flexDirection: 'row-reverse'}}>
          <View style={{alignItems: 'flex-end'}}>
            <ThemedText>
            {date.toLocaleString('en-GB', {weekday: 'long'})}, {getTime(date)}
            </ThemedText>
            <EntrySyncButton entry={props.entry} readonly/>
          </View>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
          <ThemedText style={{fontWeight: 'semibold'}}>
            Unknown entry type
          </ThemedText>
        </View>
      </ThemedBlock>
    </Pressable>
  );
};
