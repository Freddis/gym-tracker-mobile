import {FC} from 'react';
import {StyleProp, ImageStyle, ViewStyle, View, Image, Pressable} from 'react-native';
import {AppWorkout, CompleteAppWorkout} from '@/types/models/AppWorkout';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {TimerBlock} from '@/components/blocks/TimerBlock/TimerBlock';

export const WorkoutBlock: FC<{workout: CompleteAppWorkout, onPress?: (x: AppWorkout)=> void}> = (props) => {
  const workout = props.workout;
  const exercises = workout.exercises;
  const imgStyle: StyleProp<ImageStyle> = {
    width: 50,
    height: 50,
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 50,
  };
  const exerciseStyle: StyleProp<ViewStyle> = {
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'row',
  };
  const onPress = () => {
    if (props.onPress) {
      props.onPress(workout);
    }
  };
  return (
    <Pressable onPress={onPress}>
      <ThemedView style={{marginBottom: 20, display: 'flex', padding: 10, borderRadius: 5}} type="backgroundSecondary">
        <View style={{flexDirection: 'row'}}>
        <TimerBlock start={workout.start} end={workout.end ?? undefined} style={{flexDirection: 'row'}}/>
        <View style={{flexDirection: 'row-reverse', flexGrow: 1}}>
          <ThemedText>{workout.start.toLocaleString('en-GB', {weekday: 'long'})} {workout.start.toLocaleDateString()}</ThemedText>
        </View>
        </View>
        <View style={{marginBottom: 10}}>
          <ThemedText>Calories: {workout.calories}</ThemedText>
        </View>
        <View>
          {exercises.map((item, i) => (
            <ThemedView key={i} style={exerciseStyle} type="backgroundSecondary">
              <Image src={item.exercise.images[0]} style={imgStyle} />
              <View style={{marginLeft: 10, overflow: 'hidden'}}>
                <ThemedText style={{fontSize: 13, overflow: 'hidden'}}>{item.exercise.name}</ThemedText>
                {item.sets.filter((x) => x.finished).map((set, i) => (
                  <View key={i}>
                    <ThemedText style={{fontSize: 13}}>{i + 1}: {set.weight} x {set.reps}</ThemedText>
                  </View>
                ))}
              </View>
            </ThemedView>
          ))}
        </View>
      </ThemedView>
    </Pressable>
  );
};
