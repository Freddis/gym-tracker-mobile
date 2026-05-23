import {FC, Fragment} from 'react';
import {View, Pressable} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {TimerBlock} from '@/components/blocks/TimerBlock/TimerBlock';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {ThemedImage} from '@/components/blocks/ThemedImage/ThemedImage';
import {Separator} from '@/components/blocks/Separator/Separator';
import {WorkoutAppEntry} from '../../../../../../types/models/AppEntry';
import {EntrySyncButton} from '../EntrySyncButton/EntrySyncButton';
import {PrimitiveAtom, useAtom} from 'jotai';

export const WorkoutBlock: FC<{entryAtom: PrimitiveAtom<WorkoutAppEntry>, onPress?: (x: WorkoutAppEntry)=> void}> = (props) => {
  const [entry, setEntry] = useAtom(props.entryAtom);
  const workout = entry.workout;
  const exercises = workout.exercises;
  const onPress = () => {
    if (props.onPress) {
      props.onPress(entry);
    }
  };
  const getTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  const date = entry.time;
  return (
    <Pressable onPress={onPress}>
      <ThemedBlock>
        <View className="gap-s">
          <View className="flex-row items-center justify-between">
            <ThemedText className="font-bold text-lg">Workout</ThemedText>
            <ThemedText>
              {date.toLocaleDateString()}
            </ThemedText>
          </View>
          <View className="flex-row justify-between">
            <View>
              <View className="flex-row items-center">
                <ThemedText>Duration: </ThemedText>
                <TimerBlock start={workout.start} end={workout.end ?? undefined} className="flex-row"/>
              </View>
              <ThemedText>Calories: {633}</ThemedText>
            </View>
            <View className="items-end">
              <ThemedText>
              {date.toLocaleString('en-GB', {weekday: 'long'})}, {getTime(date)}
              </ThemedText>
              <EntrySyncButton entry={entry} readonly onUpdate={(e) => setEntry({...entry, updatedAt: e.updatedAt})} />
            </View>
          </View>
        </View>
        <View>
          {exercises.filter((x) => x.sets.length > 0).map((item, i) => (
            <Fragment key={item.id}>
              {<Separator/>}
              <ThemedView className="bg-surface">
                <ThemedText className="font-semibold">{item.exercise.name}</ThemedText>
                <View className="flex-row items-start mb-s">
                  <View className="mt-s grow">
                    <ThemedImage src={item.exercise.images[0]} />
                  </View>
                  <View className="ml-m overflow-hidden">
                    {item.sets.filter((x) => x.finished).map((set, i) => (
                      <View key={i}>
                        <ThemedText style={{}}>{i + 1}: {set.weight} kg x {set.reps}</ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              </ThemedView>
            </Fragment>
          ))}
        </View>
      </ThemedBlock>
    </Pressable>
  );
};
