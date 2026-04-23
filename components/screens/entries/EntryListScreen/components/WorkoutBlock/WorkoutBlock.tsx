import {FC, Fragment} from 'react';
import {View, Pressable} from 'react-native';
import {AppWorkout} from '@/types/models/AppWorkout';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {TimerBlock} from '@/components/blocks/TimerBlock/TimerBlock';
import {useAppTheme} from '@/hooks/useAppTheme';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {ThemedImage} from '@/components/blocks/ThemedImage/ThemedImage';
import {Separator} from '@/components/blocks/Separator/Separator';
import {WorkoutAppEntry} from '../../../../../../types/models/AppEntry';
import {EntrySyncButton} from '../EntrySyncButton/EntrySyncButton';

export const WorkoutBlock: FC<{entry: WorkoutAppEntry, onPress?: (x: AppWorkout)=> void}> = (props) => {
  const workout = props.entry.workout;
  const exercises = workout.exercises;
  const theme = useAppTheme();
  const onPress = () => {
    if (props.onPress) {
      props.onPress(workout);
    }
  };
  const getTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  const date = props.entry.time;
  return (
    <Pressable onPress={onPress}>
      <ThemedBlock style={{display: 'flex'}}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: theme.marginS}}>
          <ThemedText style={{fontSize: 16, fontWeight: 'bold', color: theme.accent, flexGrow: 1}}>Workout</ThemedText>
          <ThemedText>
            {date.toLocaleDateString()}
          </ThemedText>
        </View>
        <View style={{marginBottom: theme.marginS, flexDirection: 'row'}}>
          <View style={{flexGrow: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <ThemedText>Duration: </ThemedText>
              <TimerBlock start={workout.start} end={workout.end ?? undefined} style={{flexDirection: 'row'}}/>
            </View>
            <ThemedText>Calories: {633}</ThemedText>
          </View>
          <View style={{alignItems: 'flex-end'}}>
            <ThemedText>
            {date.toLocaleString('en-GB', {weekday: 'long'})}, {getTime(date)}
            </ThemedText>
            <EntrySyncButton entry={props.entry} readonly/>
          </View>
        </View>
        <View>
          {exercises.filter((x) => x.sets.length > 0).map((item, i) => (
            <Fragment key={item.id}>
              {<Separator/>}
              <ThemedView style={{flexDirection: 'column'}} type="surface">
                <ThemedText style={{fontWeight: '600', marginBottom: theme.marginS}}>{item.exercise.name}</ThemedText>
                <View style={{flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.marginS}}>
                  <View style={{marginTop: theme.marginS, flexGrow: 1}}>
                    <ThemedImage src={item.exercise.images[0]} />
                  </View>
                  <View style={{marginLeft: theme.marginM, overflow: 'hidden'}}>
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
