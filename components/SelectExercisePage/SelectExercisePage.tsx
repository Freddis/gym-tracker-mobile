import {StyleSheet, SectionList, View, FlatList} from 'react-native';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {FC, useState} from 'react';
import {useDrizzle} from '@/utils/drizzle';
import {AppExercise} from '@/types/models/AppExercise';
import {useLiveQuery} from 'drizzle-orm/expo-sqlite';
import {ThemedTextInput} from '@/components/ThemedInput';
import {ExerciseBlock} from '@/components/ExerciseBlock/ExerciseBlock';
import {useExerciseService} from '@/utils/ExerciseService/useExerciseService';
import {LoadingBlock} from '@/components/LoadingBlock/LoadingBlock';

export const SelectExercisePage: FC<{onSelect: (item: AppExercise)=>void}> = (props) => {
  const [searchName, setSearchName] = useState<string>('');
  const [db, schema] = useDrizzle();
  const [exersiceService] = useExerciseService();
  const search = searchName.trim().length >= 3 ? searchName.trim() : null;
  const query = db.select().from(schema.exercises);
  const exerciseResponse = useLiveQuery(query);
  if (exerciseResponse.error || exerciseResponse.data.length <= 0) {
    return <LoadingBlock />;
  }
  const exercises = exersiceService.processExerciseList(exerciseResponse.data, {
    nameFilter: search ?? undefined,
  });
  const items = exersiceService.createSectionListData(exercises.builtIn);
  return (
      <ThemedView style={styles.titleContainer}>
          <View style={{padding: 10}}>
            <ThemedText>Search:</ThemedText>
            <ThemedTextInput onChangeText={setSearchName} value={searchName} />
          </View>
          <View style={{paddingBottom: 80, flex: 1}}>
          <SectionList
          ListHeaderComponent={
            <>
            <View style={{padding: 10, paddingTop: 10, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              <ThemedText style={{}}>Personal Library</ThemedText>
            </View>
            <FlatList
              keyExtractor={(x) => x.id.toString()}
              data={exercises.personal}
              renderItem={(ctx) => <ExerciseBlock onPress={props.onSelect} item={ctx.item} />}
             />
            <ThemedText style={{padding: 10, paddingTop: 20}}>Built-in Library</ThemedText>
            </>
          }
          initialNumToRender={5000}
          sections={items}
          keyExtractor={(item) => item.id.toString()}
          renderSectionHeader={ (ctx) => (
            <ThemedView style={{paddingLeft: 10}} type="backgroundSecondary">
              <ThemedText style={{fontWeight: 'bold'}}>{ctx.section.title.toUpperCase()}</ThemedText>
            </ThemedView>
          )}
          renderItem={(ctx) => <ExerciseBlock onPress={props.onSelect} item={ctx.item}/>}>
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
