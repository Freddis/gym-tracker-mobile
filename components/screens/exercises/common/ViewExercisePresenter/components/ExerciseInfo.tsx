import {FC, Fragment} from 'react';
import {View} from 'react-native';
import {Exercise} from '../../../../../../openapi-client';
import {AutoAspectImage} from '../../../../../blocks/AutoAspectImage/AutoAspectImage';
import {ThemedText} from '../../../../../blocks/ThemedText/ThemedText';

export const ExerciseInfo: FC<{exercise: Exercise}> = (props) => {
  const {exercise} = props;
  const descriptionParts = (exercise.description ?? '').split(/<\d+>/g).filter((x) => x.trim() !== '');
  return (
    <>
      <AutoAspectImage source={{uri: exercise.images[0]}} className="w-full rounded-md"/>
      <ThemedText className="font-bold text-xl mt-m mb-m">{exercise.name}</ThemedText>
      <View className="mb-m">
        <ThemedText className="flex-row gap-s">
          <ThemedText className="font-bold">Equipment: </ThemedText>
          <ThemedText className="text-normal capitalize">
            {exercise.equipment ?? 'None'}
          </ThemedText>
        </ThemedText>
        <ThemedText>
          <ThemedText className="font-bold">Primary Muscles: </ThemedText>
          {exercise.muscles.primary.map((muscle, i) => (
            <Fragment key={i}>
              {i > 0 && <ThemedText>, </ThemedText>}
              <ThemedText className="text-normal capitalize">{muscle}</ThemedText>
            </Fragment>
          ))}
        </ThemedText>
        {exercise.muscles.secondary.length > 0 && (
          <ThemedText>
            <ThemedText className="font-bold">Secondary Muscles: </ThemedText>
            {exercise.muscles.secondary.map((muscle, i) => (
              <Fragment key={i}>
                {i > 0 && <ThemedText>, </ThemedText>}
                <ThemedText className="text-normal capitalize">{muscle}</ThemedText>
              </Fragment>
            ))}
          </ThemedText>
        )}
      </View>
      <View className="flex-col gap-s">
        {descriptionParts.map((paragraph, i) => (
          <ThemedText key={i}>{paragraph}</ThemedText>
        ))}
      </View>
    </>
  );
};
