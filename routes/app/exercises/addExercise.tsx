import { StyleSheet, Button, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Stack, useNavigation } from 'expo-router';
import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { schema } from '@/db/schema';
import { useState } from 'react';
import { ThemedTextInput } from '@/components/ThemedInput';

const expo = openDatabaseSync("db.db");
const db = drizzle(expo);
export default function AddExerciseScreen() {
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
    <ScrollView>
      <Stack.Screen options={{ title: "Add Exercise", headerShown: true }} />
      <ThemedView style={styles.titleContainer}>
        {/* <ThemedText type="title">Add Exercise</ThemedText> */}
        <ThemedText>Name</ThemedText>
      <ThemedTextInput onChangeText={e => setName(e)} style={styles.input}> </ThemedTextInput>
      <Button onPress={addExercise} title='Add'/>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'column',
    padding: 20,
    gap: 8,
  },
  input: {
    color: '#ffffff',
    backgroundColor: '#282828',
    borderRadius: 5,
    padding: 5,
    height: 40,
    marginBottom: 20
  }
});
