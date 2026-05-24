import {FC} from 'react';
import {View, Pressable} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {AppEntry} from '../../../../../../types/models/AppEntry';
import {EntrySyncButton} from '../EntrySyncButton/EntrySyncButton';
import {PrimitiveAtom, useAtom} from 'jotai';

export const UknownEntryBlock: FC<{entry: PrimitiveAtom<AppEntry>}> = (props) => {
  const [entry] = useAtom(props.entry);
  const getTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  const date = entry.time;
  return (
    <Pressable>
      <ThemedBlock>
        <View className="flex-row justify-between gap-s">
          <ThemedText className="font-bold text-lg">Unknown</ThemedText>
          <ThemedText>
            {date.toLocaleDateString()}
          </ThemedText>
        </View>
        <View className="flex-row justify-end">
          <View className="items-end">
            <ThemedText>
            {date.toLocaleString('en-GB', {weekday: 'long'})}, {getTime(date)}
            </ThemedText>
            <EntrySyncButton entry={entry} readonly onUpdate={() => {}}/>
          </View>
        </View>
        <View className="flex-row items-center justify-center">
          <ThemedText>
            Unknown entry type
          </ThemedText>
        </View>
      </ThemedBlock>
    </Pressable>
  );
};
