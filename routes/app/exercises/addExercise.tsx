import { StyleSheet, Button, ScrollView, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Stack, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ThemedTextInput } from '@/components/ThemedInput';
import {AppExercise} from '@/types/models/AppExercise';
import {useDrizzle} from '@/utils/drizzle';
import {ZodHelper} from '@/utils/ZodHelper/ZodHelper';
import {NewModel} from '@/types/NewModel';
import {AuthContext} from '@/components/AuthProvider/AuthContext';

export default function AddExerciseScreen() {
  const navigation = useNavigation();
  const auth = useContext(AuthContext);
  const params = useLocalSearchParams()
  const [db,schema] = useDrizzle()
  const [description,setDescription] = useState('')
  const [image,setImage] = useState<string | null>(null)
  const placeHolderImage = require('@/assets/images/react-logo.png');
  const [baseExercise, setBaseExercise] = useState<AppExercise| null>(null)
  const router = useRouter();
  const [name,setName] = useState('');
  const exerciseId = params.exerciseId;
  useEffect(() => {
    const validated = ZodHelper.validators.numberOrStringNumber.safeParse(exerciseId);
    if(!validated.success){
      return;
    }
    db.query.exercises.findFirst({
      where: (t,op) => op.eq(t.id,validated.data)
    }).then( item => {
      if(!item){
        return;
      }
      setBaseExercise(item)
      setName(item.name)
      setImage(item.images[0] ?? null)
      setDescription(item.description ?? description)
    })
  },[exerciseId])
  const user = auth.user;
  if(!user){
    return null;
  }
  
  const addExercise = async () => {
    if(name.trim() === ''){
      alert("Invalid name");
      return;
    }
    const newValue: NewModel<AppExercise> = {
      externalId: null,
      name: name,
      description: description,
      difficulty: baseExercise?.difficulty ?? null,
      equipmentId: 0,
      images: baseExercise?.images ?? [],
      params: baseExercise?.params ?? [],
      userId: user.id,
      copiedFromId: baseExercise?.id ?? null,
      parentExerciseId: null,
      createdAt: new Date(),
      updatedAt: null
    }
    await db.insert(schema.exercises).values(newValue)
    navigation.goBack()
  }

  const copy = () => {
    router.push({
      pathname: '/app/exercises/selectExercise',
      params: {
        value: 1
      }
    })
  }

  return (
    <ScrollView>
      <Stack.Screen options={{ title: "Add Exercise", headerShown: true }} />
      <ThemedView style={styles.titleContainer}>
        <Button onPress={copy} title='Copy from Built-in Library' />
        <ThemedText>Name</ThemedText>
        <ThemedTextInput onChangeText={e => setName(e)} value={name} style={styles.input}> </ThemedTextInput>
        <ThemedText>Description</ThemedText>
        <ThemedTextInput onChangeText={e => setDescription(e)} value={description} style={styles.input}> </ThemedTextInput>
        <ThemedText>Image</ThemedText>
        <Image source={placeHolderImage} src={image ?? undefined} style={{width: 50, height: 50}}></Image>
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
