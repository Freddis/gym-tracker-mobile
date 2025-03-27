import {StyleSheet, Button, SectionList, Image} from 'react-native';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {useNavigation} from '@react-navigation/native';
import {drizzle} from 'drizzle-orm/expo-sqlite';
import {openDatabaseSync} from 'expo-sqlite';
import {useState} from 'react';
import React from 'react';
import {Link, Stack} from 'expo-router';
import {Exercise, exerciseData} from '@/data/exercises';

const expo = openDatabaseSync('db.db');
const db = drizzle(expo);
export default function ExcercisePage() {
  const navigation = useNavigation();
  navigation.addListener('focus', () => {
    setfocusedCounter(focusedCounter + 1);
  });
  const [focusedCounter, setfocusedCounter] = useState(0);
  // const exerciseResponse = useLiveQuery(db.select().from(schema.exercises), [focusedCounter]);
  const primaryExercises = new Map<string,Exercise & {children: Exercise[]}>();
  for(const item of exerciseData.exercises) {
    if(item.name.includes('(')){
      continue
    }
    if(item.main_exclude === '1'){
      continue;
    }
    primaryExercises.set(item.name,{...item, children: []})
  }

  for(const item of exerciseData.exercises) {
    if(!item.name.includes('(')){
      continue
    }
    const stripped = item.name.split('(')[0];
    if(!stripped){
      continue;
    }
    if(item.main_exclude === '1'){
      continue;
    }
    const primary = primaryExercises.get(stripped)
    if(!primary){
      console.log(`Not fouund primary exercise for ${stripped}`);
      continue;
    }
    primary.children.push(item);
  }
  const nestedExercises = Array.from(primaryExercises.values());
  const map = new Map<string, Exercise[]>();
  for (const item of nestedExercises) {
    if (!item.name) {
      continue;
    }
    if(item.primaryCategory === 'Cardio'){
      continue;
    }
    const firstLetter = item.name[0]?.toUpperCase();
    if (!firstLetter) {
      continue;
    }

    const section = map.get(firstLetter) ?? [];
    section.push(item);
    map.set(firstLetter, section);
  }
  const items = Array.from(map.entries())
  .sort((a,b) => a[0] > b[0] ? 1 : -1)
  .map( x => ({
    title: x[0],
    data: x[1].sort( (a,b) => (a.name ?? '') > (b.name ?? '') ? 1: -1),
  }));

  return (
      <ThemedView style={styles.titleContainer}>
          <Stack.Screen options={{ title: "Exercise Library", headerShown: true }} />
          {/* <ThemedText type="title" style={{paddingLeft: 20, marginTop: 70}}>Exercise Library</ThemedText> */}
          <Link href={'/(tabs)/exercises/addExercise'} style={{ marginTop: 70}} asChild>
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
              <ThemedView style={{flexDirection: 'row'}}>
                <Image style={{width:70, height: 70, paddingLeft: 0, objectFit: 'contain'}} 
                src={'http://images.skyhealth.com/fb_app_images/fitness_img_v5.0/'+ctx.item.name.replaceAll(' ', '+')+'-a.jpg'} />
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
    // padding: 20,
    gap: 8,
    flex: 1,
  },
});