import {SectionList, View} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {FC} from 'react';
import {Exercise} from '../../../../../openapi-client';
import {AppScreenContainer} from '../../../../blocks/AppScreenContainer/AppScreenContainer';
import {ExerciseInfo} from './components/ExerciseInfo';
import {ExerciseHistoryRow} from '../../../../../utils/WorkoutService/types/ExerciseHistoryRow';

type ViewExercisePresenterProps = {
  exercise: Exercise;
  history: ExerciseHistoryRow[];
};

export const ViewExercisePresenter: FC<ViewExercisePresenterProps> = (props) => {
  const {exercise, history} = props;
  const sections = history.map((row) => ({
    title: row.date.toISOString().substring(0, 10),
    data: row.sets,
  }));
  return (
    <AppScreenContainer>
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
    </AppScreenContainer>
  );
};
