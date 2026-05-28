import {Stack, useFocusEffect} from 'expo-router';
import {ScreenContainer} from '../../../blocks/ScreenContainer/ScreenContainer';
import {CSSProperties, FC, useCallback, useRef, useState} from 'react';
import {ThemedText} from '../../../blocks/ThemedText/ThemedText';
import {LayoutChangeEvent, useColorScheme, View} from 'react-native';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {ThemedBlock} from '../../../blocks/ThemedBlock/ThemedBlock';
import {PieChart} from 'react-native-gifted-charts';
import {useAppTheme} from '../../../../hooks/useAppTheme';
import {LoadingBlock} from '../../../blocks/LoadingBlock/LoadingBlock';
import {useQuery} from '@tanstack/react-query';
import {queryClient} from '../../../../routes/_layout';

export const customColors = {
  carbs: '#22c55e',
  protein: '#3b82f6',
  fat: '#eab308',
  calories: '#ef4444',
} as const satisfies Record<string, Exclude<CSSProperties['color'], undefined>>;


export const DashboardScreen: FC = () => {
  const {dashboardService} = useServices();
  const theme = useAppTheme();
  const mode = useColorScheme();
  const [radius, setRadius] = useState(25);
  const response = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getCalorieGoal(),
  });
  const hasRun = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (hasRun.current) {
        return;
      }
      hasRun.current = true;
      // runs only once ever per mount/focus cycle
      console.log('invalidating dashboard');
      queryClient.invalidateQueries({queryKey: ['dashboard']});

      return () => {
        // reset if you want it to run again next time screen focuses
        hasRun.current = false;
      };
    }, [])
  );

  if (!response.data || response.isLoading) {
    return (
    <ScreenContainer safeTop={true}>
      <LoadingBlock />
    </ScreenContainer>
    );
  }
  const {consumedCalories, goal} = response.data;
  const data = [
    {value: consumedCalories.protein, color: customColors.protein},
    {value: consumedCalories.fat, color: customColors.fat},
    {value: consumedCalories.carbs, color: customColors.carbs},
  ];
  const emptyColor = mode === 'dark' ? 'black' : 'white';
  const calorieData = [
    {value: consumedCalories.calories, color: customColors.calories},
    {value: goal.calories - consumedCalories.calories, color: emptyColor},
  ];
  const proteinData = [
    {value: consumedCalories.protein, color: customColors.protein},
    {value: goal.protein ? goal.protein - consumedCalories.protein : 0, color: emptyColor},
  ];
  const carbsData = [
    {value: consumedCalories.carbs, color: customColors.carbs},
    {value: goal.carbs ? goal.carbs - consumedCalories.carbs : 0, color: emptyColor},
  ];
  const fatData = [
    {value: consumedCalories.fat, color: customColors.fat},
    {value: goal.fat ? goal.fat - consumedCalories.fat : 0, color: emptyColor},
  ];
  const onLayout = (event: LayoutChangeEvent) => {
    console.log('onLayout');
    const {width} = event.nativeEvent.layout;
    const numberOfItems = 5;
    const gaps = numberOfItems - 1;
    const gapWidth = gaps * 1;
    const padding = 10;
    const availableWidth = width - gapWidth - padding * 2;
    const effectiveDiameter = availableWidth / numberOfItems;
    setRadius(effectiveDiameter / 2);
  };
  return (
    <ScreenContainer safeTop={true}>
      <Stack.Screen options={{title: 'Dashboard', headerShown: false}} />
      <View className="h-full p-s">
        <ThemedBlock>
          <View className="gap-m">
            <View className="flex-row gap-s items-center justify-between" onLayout={onLayout}>
              <ThemedText>Calorie Goal</ThemedText>
              <ThemedText>From {goal.start?.toLocaleDateString()}</ThemedText>
            </View>
            <View className="flex-row h-30 justify-between">
              <PieChart strokeColor="white" strokeWidth={2} data = {data} radius={radius}/>
              <View className="items-center gap-1">
                <PieChart data = {calorieData} radius={radius} donut backgroundColor={theme.surface}/>
                <ThemedText>{consumedCalories.calories.toFixed(0)}/{goal.calories.toFixed(0)}</ThemedText>
                <ThemedText>Calories</ThemedText>
              </View>
              <View className="items-center gap-1">
                <PieChart data = {proteinData} radius={radius} donut backgroundColor={theme.surface}/>
                <ThemedText>{consumedCalories.protein.toFixed(0)}{goal.protein ? `/ ${goal.protein.toFixed(0)}` : ''}g</ThemedText>
                <ThemedText>Protein</ThemedText>
              </View>
              <View className="items-center gap-1">
                <PieChart data = {fatData} radius={radius} donut backgroundColor={theme.surface}/>
                <ThemedText>{consumedCalories.fat.toFixed(0)}{goal.fat ? `/ ${goal.fat.toFixed(0)}` : ''}g</ThemedText>
                <ThemedText>Fat</ThemedText>
              </View>
              <View className="items-center gap-1">
                <PieChart data = {carbsData} radius={radius} donut backgroundColor={theme.surface}/>
                <ThemedText>{consumedCalories.carbs.toFixed(0)}{goal.carbs ? `/ ${goal.carbs.toFixed(0)}` : ''}g</ThemedText>
                <ThemedText>Carbs</ThemedText>
              </View>

            </View>
          </View>
        </ThemedBlock>
      </View>
    </ScreenContainer>
  );
};
