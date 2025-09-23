import {FC, Fragment} from 'react';
import {StyleProp, ImageStyle, ViewStyle, View, Image, Pressable} from 'react-native';
import {AppWorkout, CompleteAppWorkout} from '@/types/models/AppWorkout';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {TimerBlock} from '@/components/blocks/TimerBlock/TimerBlock';
import {WorkoutSyncButton} from '../../../WorkoutScreen/components/WorkoutSyncButton/WorkoutSyncButton';
import {useAppTheme} from '@/hooks/useAppTheme';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {ThemedImage} from '@/components/blocks/ThemedImage/ThemedImage';
import {Separator} from '@/components/blocks/Separator/Separator';

export const WorkoutBlock: FC<{workout: CompleteAppWorkout, onPress?: (x: AppWorkout)=> void}> = (props) => {
  const workout = props.workout;
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
  return (
    <Pressable onPress={onPress}>
      <ThemedBlock style={{display: 'flex'}}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
          <ThemedText style={{fontSize: 16, fontWeight: 'bold', color: theme.accent, flexGrow: 1}}>Workout</ThemedText>
          <ThemedText>
            {workout.start.toLocaleDateString()}
          </ThemedText>

        </View>
        <View style={{marginBottom: 10, flexDirection: 'row'}}>
          <View style={{flexGrow: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <ThemedText>Duration: </ThemedText>
              <TimerBlock start={workout.start} end={workout.end ?? undefined} style={{flexDirection: 'row'}}/>
            </View>
            <ThemedText>Calories: {workout.calories}</ThemedText>
          </View>
          <View style={{alignItems: 'flex-end'}}>
            <ThemedText>
            {workout.start.toLocaleString('en-GB', {weekday: 'long'})}, {getTime(workout.start)}
            </ThemedText>
            <WorkoutSyncButton workout={workout} readonly/>
          </View>
        </View>
        <View>
          {exercises.filter((x) => x.sets.length > 0).map((item, i) => (
            <Fragment key={item.id}>
              {i > 0 && <Separator/>}
              <ThemedView style={{flexDirection: 'column'}} type="surface">
                <ThemedText style={{overflow: 'hidden', fontWeight: '600', marginBottom: 5}}>{item.exercise.name}</ThemedText>
                <View style={{flexDirection: 'row', alignItems: 'flex-start', marginBottom: 5}}>
                  <View style={{marginTop: 5, flexGrow: 1}}>
                    <ThemedImage src={item.exercise.images[0]} />
                  </View>
                  <View style={{marginLeft: 10, overflow: 'hidden'}}>
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
