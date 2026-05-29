import {LayoutChangeEvent, useColorScheme, View} from 'react-native';
import {ThemedBlock} from '../../../../blocks/ThemedBlock/ThemedBlock';
import {ThemedText} from '../../../../blocks/ThemedText/ThemedText';
import {PieChart} from 'react-native-gifted-charts';
import {CSSProperties, FC, useState} from 'react';
import {useAppTheme} from '../../../../../hooks/useAppTheme';
import {AppCalorieGoalStats} from '../../../../../utils/DashboardService/types/AppCalorieGoalStats';

export const customColors = {
  carbs: '#22c55e',
  protein: '#3b82f6',
  fat: '#eab308',
  calories: '#ef4444',
} as const satisfies Record<string, Exclude<CSSProperties['color'], undefined>>;

interface CalorieGoalProps {
  goal: AppCalorieGoalStats;
}

export const CalorieGoalBlock:FC<CalorieGoalProps> = (props) => {
  const {consumedCalories, goal} = props.goal;
  const theme = useAppTheme();
  const mode = useColorScheme();
  const [radius, setRadius] = useState(25);

  const noConsumed = consumedCalories.calories === 0;
  const data = [
    {value: noConsumed ? 1 : consumedCalories.protein, color: customColors.protein},
    {value: noConsumed ? 1 : consumedCalories.fat, color: customColors.fat},
    {value: noConsumed ? 1 : consumedCalories.carbs, color: customColors.carbs},
  ];
  const emptyColor = mode === 'dark' ? 'black' : 'white';
  const calorieData = [
    {value: consumedCalories.calories, color: customColors.calories},
    {value: goal.calories - consumedCalories.calories, color: emptyColor},
  ];
  const proteinData = [
    noConsumed ? undefined : {value: consumedCalories.protein, color: customColors.protein},
    {value: goal.protein ? goal.protein - consumedCalories.protein : 0, color: emptyColor},
  ].filter((item) => item !== undefined);
  const carbsData = [
    noConsumed ? undefined : {value: consumedCalories.carbs, color: customColors.carbs},
    {value: goal.carbs ? goal.carbs - consumedCalories.carbs : 0, color: emptyColor},
  ].filter((item) => item !== undefined);
  const fatData = [
    noConsumed ? undefined : {value: consumedCalories.fat, color: customColors.fat},
    {value: goal.fat ? goal.fat - consumedCalories.fat : 0, color: emptyColor},
  ].filter((item) => item !== undefined);
  const onLayout = (event: LayoutChangeEvent) => {
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
  );
};
