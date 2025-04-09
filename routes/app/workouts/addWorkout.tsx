import { StyleSheet, Button, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Stack, useNavigation } from 'expo-router';
import { FC, useEffect, useState } from 'react';
import { ThemedTextInput } from '@/components/ThemedInput';

export const TimerBlock: FC = () => {
  const [started] = useState(new Date());
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    setTimeout(() => {
      setNow(new Date())
    },1000)
  })
  const diff = Math.floor(now.getTime() - started.getTime());
  const hourMs = 1000*60*60;
  const minuteMs = 1000*60;
  const secondMs = 1000;
  const hours = Math.floor(diff/hourMs);
  const minutes = Math.floor((diff - hours*hourMs)/minuteMs);
  const seconds = Math.floor((diff - hours*hourMs - minutes*minuteMs)/secondMs)
  const hoursStr = String(hours).padStart(2,'0');
  const minutesStr = String(minutes).padStart(2,'0');
  const secondsStr = String(seconds).padStart(2,'0');
  return <ThemedText>{hoursStr}:{minutesStr}:{secondsStr}</ThemedText>
}

export default function AddWorkoutScreen() {
  const navigation = useNavigation();
  const [name,setName] = useState('');
  const addExercise = async () => {
    if(name.trim() === ''){
      alert("Invalid name");
      return;
    }
    // await db.insert(schema.exercises).values({
    //   name: name.trim(),
    //   createdAt: 1000,
    // })
    navigation.goBack()
  }

  return (   
    <ThemedView style={styles.titleContainer}>
      <Stack.Screen options={{ title: "Add Workout", headerShown: true }} />
      {/* <ThemedText type="title">Add Exercise</ThemedText> */}
      <ThemedText>New Workout</ThemedText>
      <TimerBlock />
      <ThemedText>Name</ThemedText>
      <ThemedTextInput onChangeText={e => setName(e)} />
      <Button onPress={addExercise} title='Add Exercise'/>
      <View style={{marginTop: 20}}>
        <Button onPress={addExercise} title='Finish Workout'/>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'column',
    padding: 20,
    gap: 8,
    flex: 1,
    flexGrow: 1,
  }
});
