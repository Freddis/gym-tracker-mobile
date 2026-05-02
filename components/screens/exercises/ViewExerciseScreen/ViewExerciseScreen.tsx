import {StyleSheet, Image, View} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {Stack, useLocalSearchParams, useRouter} from 'expo-router';
import {FC, Fragment} from 'react';
import {useExerciseService} from '../../../../utils/ExerciseService/useExerciseService';
import {useQuery} from '@tanstack/react-query';
import {LoadingBlock} from '../../../blocks/LoadingBlock/LoadingBlock';
import {useAppTheme} from '../../../../hooks/useAppTheme';
import {Theme} from '../../../../types/Colors';
import {ScreenContainer} from '../../../blocks/ScreenContainer/ScreenContainer';
import {ThemedScrollView} from '../../../blocks/ThemedScrollView/ThemedScrollView';
import {ThemedLink} from '../../../blocks/ThemedLink/ThemedLink';
import {string} from 'zod';

export const ViewExerciseScreen: FC = () => {
  const params = useLocalSearchParams();
  const placeHolderImage = require('@/assets/images/icon.png');
  const theme = useAppTheme();
  const router = useRouter();
  const [service] = useExerciseService();
  const validated = string().safeParse(params.exerciseId);
  const exerciseId = validated.success ? validated.data : '';

  const result = useQuery({
    queryFn: () => service.getExercise(exerciseId),
    queryKey: ['exercises', exerciseId],
  });
  const exercise = result.data;

  if (!exercise) {
    return <LoadingBlock />;
  }

  const descriptionParts = (exercise.description ?? '')
    .split(/<\d+>/g)
    .filter((x) => x.trim() !== '');

  const styles = getStyles(theme);
  const onEditPress = () => {
    router.navigate({
      pathname: '/app/exercises/editExercise',
      params: {
        exerciseId: exercise.id,
      },
    });
  };
  return (
    <ThemedScrollView style={styles.scroll}>
      <ScreenContainer style={styles.container}>
        <Stack.Screen
          options={{
            title: `${exercise.name}`,
            headerShown: true,
            headerRight: () =>
              exercise.userId && (
                <ThemedLink onPress={onEditPress}>Edit</ThemedLink>
              ),
          }}
        />
        <Image
          source={placeHolderImage}
          src={exercise.images[0] ?? undefined}
          style={styles.image}
        />
        <ThemedText style={styles.title}>{exercise.name}</ThemedText>
        <View style={styles.equipmentBlock}>
          <ThemedText style={styles.boldRow}>
            <ThemedText>Equipment: </ThemedText>
            <ThemedText style={styles.normalText}>
              {exercise.equipment ?? 'None'}
            </ThemedText>
          </ThemedText>
          <ThemedText style={styles.bold}>
            <ThemedText>Primary Muscles: </ThemedText>
            {exercise.muscles.primary.map((muscle, i) => (
              <Fragment key={i}>
                {i > 0 && <ThemedText>, </ThemedText>}
                <ThemedText style={styles.normalText}>{muscle}</ThemedText>
              </Fragment>
            ))}
          </ThemedText>
          {exercise.muscles.secondary.length > 0 && (
            <ThemedText style={styles.bold}>
              <ThemedText>Secondary Muscles: </ThemedText>
              {exercise.muscles.secondary.map((muscle, i) => (
                <Fragment key={i}>
                  {i > 0 && <ThemedText>, </ThemedText>}
                  <ThemedText style={styles.normalText}>{muscle}</ThemedText>
                </Fragment>
              ))}
            </ThemedText>
          )}
        </View>
        <View style={styles.descriptionBlock}>
          {descriptionParts.map((paragraph, i) => (
            <ThemedText key={i}>{paragraph}</ThemedText>
          ))}
        </View>
      </ScreenContainer>
    </ThemedScrollView>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    scroll: {
      minHeight: '100%',
    },
    container: {
      paddingTop: theme.paddingM,
    },
    title: {
      color: theme.accent,
      marginTop: theme.marginM,
      marginBottom: theme.marginM,
    },
    image: {
      width: '100%',
      height: 200,
      backgroundColor: 'blue',
      resizeMode: 'cover',
      borderRadius: 10,
      aspectRatio: 1,
    },
    equipmentBlock: {
      marginBottom: theme.marginM,
    },
    boldRow: {
      fontWeight: 'bold',
      flexDirection: 'row',
      gap: 5,
    },
    bold: {
      fontWeight: 'bold',
    },
    normalText: {
      fontWeight: 'normal',
      textTransform: 'capitalize',
    },
    descriptionBlock: {
      flexDirection: 'column',
      gap: theme.marginS,
    },
  });
