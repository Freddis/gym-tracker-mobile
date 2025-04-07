import {StyleSheet, Button, SectionList, Image, StyleProp, ImageStyle} from 'react-native';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import React from 'react';
import {Link, Stack} from 'expo-router';
import {useDrizzle} from '@/utils/drizzle';
import {openApiRequest} from '@/utils/openApiRequest';
import {getExercises} from '@/openapi-client';
import {AppExercise} from '@/types/models/AppExercise';
import {NewModel} from '@/types/NewModel';
import {eq} from 'drizzle-orm';
import {useLiveQuery} from 'drizzle-orm/expo-sqlite';

export default function ExcercisePage() {
  const navigation = useNavigation();
  navigation.addListener('focus', () => {
    setfocusedCounter(focusedCounter + 1);
  });
  const [focusedCounter, setfocusedCounter] = useState(0);
  const [db,schema] = useDrizzle();
  useEffect(() => {
    syncExercises()
  },[])

  const syncExercises = async () => {
    const response = await openApiRequest(getExercises,{});
    if(response.error){
      return;
    }
    for(const exercise of response.data.items) {
      const newRow: NewModel<AppExercise> = {
        params: exercise.params,
        name: exercise.name,
        description: exercise.description,
        difficulty: exercise.difficulty,
        equipmentId: exercise.equipmentId,
        images: exercise.images,
        userId: exercise.userId,
        copiedFromId: exercise.copiedFromId,
        parentExerciseId: exercise.parentExerciseId,
        createdAt: new Date(),
        updatedAt: null,
        externalId: exercise.id
      }
      const existing = await db.query.exercises.findFirst({
        where: (t,op) => op.eq(t.externalId,exercise.id)
      })
      if(existing){
        await db.update(schema.exercises).set(newRow).where(
          eq(schema.exercises.externalId,exercise.id)
        )
        continue;
      }
      await db.insert(schema.exercises).values({
        ...newRow,
        updatedAt: new Date(),
      })
    }
  }
  
  const query = db.select().from(schema.exercises)
  const exerciseResponse = useLiveQuery(query, [focusedCounter]);
  if(exerciseResponse.error || exerciseResponse.data.length <= 0){
    return null;
  }
  const map = new Map<number, AppExercise[]>();
  const primaryExercises: AppExercise[] = [];
  const personalExercises: AppExercise[] = [];
  const searchName: string | null = null as any;
  for (const exercise of exerciseResponse.data) {
    if (searchName !== null && !exercise.name.toLocaleLowerCase().includes(searchName.toLocaleLowerCase())) {
      continue;
    }
    if (exercise.userId !== null) {
      personalExercises.push(exercise);
      continue;
    }

    if (exercise.parentExerciseId == null) {
      if (searchName !== null && !exercise.name.toLocaleLowerCase().includes(searchName.toLocaleLowerCase())) {
        continue;
      }
      primaryExercises.push(exercise);
      continue;
    }

    const existing = map.get(exercise.parentExerciseId) ?? [];
    existing.push(exercise);
    map.set(exercise.parentExerciseId, existing);
  }
  const nestedExercises = primaryExercises.map((item) => ({
    ...item,
    variations: map.get(item.id),
  }));
  const sectionMap = new Map<string,typeof nestedExercises>();
  for(const row of nestedExercises){
    const firstLetter =  row.name.charAt(0).toLowerCase()
    const value = sectionMap.get(firstLetter) ?? []
    value.push(row)
    sectionMap.set(firstLetter,value)
  }

  const items =  Array.from(sectionMap.entries()).map( val => ({
    title: val[0],
    data: val[1],
  }))

  const imgStyle: StyleProp<ImageStyle> = {
    width:70,
    height: 70, 
    borderRadius: 100, 
    borderWidth: 3, 
    borderColor: 'white', 
    paddingLeft: 0, 
    objectFit: 'fill'
  }

  return (
      <ThemedView style={styles.titleContainer}>
          <Stack.Screen options={{ title: "Exercise Library", headerShown: false }} />
          <ThemedText type="title" style={{paddingLeft: 20, marginTop: 70}}>Exercise Library</ThemedText>
          <Link href={'./addExercise'} style={{ marginTop: 70}} asChild>
              <Button title="Add Exercise"></Button>
          </Link>
          <SectionList 
            sections={items}
            renderSectionHeader={ ctx =>(
              <ThemedView style={{paddingLeft: 5}} type='backgroundSecondary'>
                <ThemedText style={{fontWeight: 'bold'}}>{ctx.section.title}</ThemedText>
              </ThemedView>
            )}
            renderItem={ctx => (
              <ThemedView style={{flexDirection: 'row', marginTop: 10}}>
                <Image style={imgStyle} src={ctx.item.images[0]} />
                <ThemedText style={{fontSize: 18, padding: 15}}>{ctx.item.name}</ThemedText>
              </ThemedView>
            )}
          >
          </SectionList>
      </ThemedView>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'column',
    gap: 8,
    flex: 1,
  },
});