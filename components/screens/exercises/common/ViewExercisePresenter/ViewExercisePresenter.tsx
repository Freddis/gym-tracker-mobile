import {SectionList, View} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {FC} from 'react';
import {Exercise} from '../../../../../openapi-client';
import {AppWorkoutExerciseSet} from '../../../../../types/models/AppWorkoutExerciseSet';
import {ScreenContainer} from '../../../../blocks/ScreenContainer/ScreenContainer';
import {ExerciseInfo} from './components/ExerciseInfo';

type ViewExercisePresenterProps = {
  exercise: Exercise;
  history: AppWorkoutExerciseSet[];
};

export const ViewExercisePresenter: FC<ViewExercisePresenterProps> = (props) => {
  const {exercise, history} = props;
  const initialState: Record<string, {title: string, data: AppWorkoutExerciseSet[]}> = {};
  const sectionsMap = history.reduce((acc, set) => {
    const key = set.start!.toISOString().substring(0, 10);
    if (!acc[key]) {
      acc[key] = {
        title: key,
        data: [],
      };
    }
    acc[key].data.push(set);
    return acc;
  }, initialState);
  const sections = Object.values(sectionsMap);
  for (const section of sections) {
    section.data.sort((a, b) => {
      const aStart = a.start ?? new Date(0);
      const bStart = b.start ?? new Date(0);
      return aStart.getTime() - bStart.getTime();
    });
  }


  return (
    <ScreenContainer>
      <SectionList
        contentContainerClassName="p-m min-h-full"
        ListHeaderComponent={<View className="mb-m"><ExerciseInfo exercise={exercise} /></View>}
        sections={sections}
        renderSectionHeader={({section}) => (
          <ThemedText className="px-s py-1 font-bold bg-surface">
            {section.title}
          </ThemedText>
        )}
        renderItem={({item, index}) => (
          <View className="p-s border-b border-surface/50">
            <ThemedText className="bg-main">
              Set {index + 1}: {item.weight}kg × {item.reps}
            </ThemedText>
          </View>
          )}
        />
    </ScreenContainer>
  );
};
