import {StyleSheet, SectionList, View, FlatList} from 'react-native';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {useNavigation} from '@react-navigation/native';
import {useState} from 'react';
import React from 'react';
import {Stack, useLocalSearchParams, useRouter} from 'expo-router';
import {useDrizzle} from '@/utils/drizzle';
import {AppExercise} from '@/types/models/AppExercise';
import {useLiveQuery} from 'drizzle-orm/expo-sqlite';
import {ThemedTextInput} from '@/components/ThemedInput';
import {ExerciseBlock} from '@/components/ExerciseBlock/ExerciseBlock';


export default function ExcercisePage() {
  const navigation = useNavigation();
  const use = useLocalSearchParams()
  navigation.addListener('focus', () => {
    setfocusedCounter(focusedCounter + 1);
  });
  const router = useRouter()
  const [searchName, setSearchName] = useState<string>('')
  const [focusedCounter, setfocusedCounter] = useState(0);
  const [db,schema] = useDrizzle();
  const search = searchName.trim().length >= 3 ? searchName.trim() :  null;
  const query = db.select().from(schema.exercises)
  const exerciseResponse = useLiveQuery(query, [focusedCounter]);
  if(exerciseResponse.error || exerciseResponse.data.length <= 0){
    return (
      <ThemedView style={styles.titleContainer}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    )
  }
  const map = new Map<number, AppExercise[]>();
  const primaryExercises: AppExercise[] = [];
  const personalExercises: AppExercise[] = [];
  for (const exercise of exerciseResponse.data) {
    if(exercise.name.trim() === ''){
      continue;
    }
    if (search !== null && !exercise.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())) {
      continue;
    }
    if (exercise.userId !== null) {
      personalExercises.push(exercise);
      continue;
    }

    if (exercise.parentExerciseId === null) {
      if (search !== null && !exercise.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())) {
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
    variations: map.get(item.externalId ?? 0),
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

  const select = (exercise: AppExercise) => {
    console.log(`Select ${exercise.id}`)
    router.dismissTo({
      pathname: '/app/exercises/addExercise',
      params: {
        exerciseId: exercise.id
      }
    })
  }

  return (
      <ThemedView style={styles.titleContainer}>
          <Stack.Screen options={{ title: "Exercise Library", headerShown: true }} />
          <View style={{padding: 10}}>
            <ThemedText>Search:</ThemedText>
            <ThemedTextInput onChangeText={setSearchName} value={searchName} />
          </View>
          <View style={{paddingBottom: 80, flex: 1}}>
          <SectionList 
          ListHeaderComponent={ 
            <>
            <View style={{padding: 10, paddingTop: 10, display: 'flex', flexDirection: 'row',alignItems: 'center' }}>
              <ThemedText  style={{}}>Personal Library</ThemedText>
            </View>
            <FlatList keyExtractor={x => x.id.toString()} data={personalExercises} renderItem={ctx => <ExerciseBlock onPress={select} item={ctx.item} />} />
            <ThemedText style={{padding: 10, paddingTop: 20}}>Built-in Library</ThemedText>
            </>
          }
            sections={items}
            keyExtractor={item => item.id.toString()}
            renderSectionHeader={ ctx =>(
              <ThemedView style={{paddingLeft: 10}} type='backgroundSecondary'>
                <ThemedText style={{fontWeight: 'bold'}}>{ctx.section.title.toUpperCase()}</ThemedText>
              </ThemedView>
            )}
            renderItem={ctx => <ExerciseBlock onPress={select} item={ctx.item}/>}>
          </SectionList>
          </View>
      </ThemedView>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
});