import {LayoutChangeEvent, useColorScheme, View} from 'react-native';
import {ThemedBlock} from '../../../../blocks/ThemedBlock/ThemedBlock';
import {ThemedText} from '../../../../blocks/ThemedText/ThemedText';
import {BarChart, PieChart, stackDataItem} from 'react-native-gifted-charts';
import {CSSProperties, FC, useState} from 'react';
import {useAppTheme} from '../../../../../hooks/useAppTheme';
import {AppCalorieGoalStats} from '../../../../../utils/DashboardService/types/AppCalorieGoalStats';
import {ConsumedCalories} from '../../../../../openapi-client';
import {getFirstLastAndMiddleIndexes} from '../utils/getFirstLastAndMiddleIndexes';
import {cn} from '../../../../../cn';

export const customColors = {
  carbs: '#22c55e',
  protein: '#3b82f6',
  fat: '#eab308',
  calories: '#ef4444',
} as const satisfies Record<string, Exclude<CSSProperties['color'], undefined>>;

interface CalorieGoalProps {
  goal: AppCalorieGoalStats;
}

const roundUpToStep = (value: number, step: number): number => {
  return Math.ceil(value / step) * step;
};

export const CalorieGoalBlock:FC<CalorieGoalProps> = (props) => {
  const {consumedCalories, goal, history, size} = props.goal;
  const theme = useAppTheme();
  const mode = useColorScheme();
  const [radius, setRadius] = useState(25);
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
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

  const historyWithoutToday = history.filter((item) => item.date.toDateString() !== new Date().toDateString());

  const onLayout = (event: LayoutChangeEvent) => {
    const {width} = event.nativeEvent.layout;
    const numberOfItems = 5;
    const gaps = numberOfItems - 1;
    const gapWidth = gaps * 1;
    const padding = 10;
    const availableWidth = width - gapWidth - padding * 2;
    const effectiveDiameter = availableWidth / numberOfItems;
    setRadius(effectiveDiameter / 2);
    setWidth(availableWidth);
  };

  const buildChart = (
    history: {value: ConsumedCalories, date: Date}[],
    historySize: number,
    endDate: Date = new Date()
  ): stackDataItem[] => {
    const DAY = 1000 * 60 * 60 * 24;
    const DAYS = historySize;
    const from = endDate.getTime();
    const to = from - DAYS * DAY;
    const result: stackDataItem[] = [];
  // Sort ascending
    const weights = [...history].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
    const labels: string[] = [];
    const values: (ConsumedCalories | undefined)[] = [];
    let weightIndex = 0;
    let currentPoint: {value: ConsumedCalories, date: Date} | undefined;
    for (let time = to; time <= from; time += DAY) {
      const currentDate = new Date(time);

     // Advance weights while entries are before current hour
      let point = weights[weightIndex];
      while (point && point.date.getTime() <= time) {
        currentPoint = point;
        weightIndex++;
        point = weights[weightIndex];
      }
      values.push(currentPoint?.value ? currentPoint.value : undefined);


      // Show label only once per day
      const day = currentDate.getDate().toString().padStart(2, '0');
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const label = `${day}/${month}`;
      labels.push(label);
      const stackDataItem: stackDataItem = {
        stacks: [
          {value: currentPoint ? currentPoint.value.protein * 4 : 0, color: customColors.protein},
          {value: currentPoint ? currentPoint.value.fat * 9 : 0, color: customColors.fat},
          {value: currentPoint ? currentPoint.value.carbs * 4 : 0, color: customColors.carbs},
        ],
        label: label,
      };
      currentPoint = undefined;
      result.push(stackDataItem);
    }
    return result;
    // return {labels, values};
  };
  const customLabel = (val: string, last?: boolean) => {
    return (
        <View className={cn('w-13', last ? '-ml-4' : '-ml-4')}>
            <ThemedText style={{color: 'white', fontWeight: 'bold', fontSize: 10}}>{val}</ThemedText>
        </View>
    );
  };

  const deviation = historyWithoutToday.reduce(
    (acc, curr) => acc + (curr.value.calories - goal.calories
  ), 0) / historyWithoutToday.length;
  const deviationPercentage = (deviation / goal.calories * 100).toFixed(1);
  const stackData = buildChart(historyWithoutToday, size, new Date(new Date().getTime() - 1000 * 60 * 60 * 24));
  const keyIndexes = getFirstLastAndMiddleIndexes(stackData.length, 3);
  for (const index of keyIndexes) {
    const entry = stackData[index];
    const label = entry?.label;
    if (!entry || !label) {
      continue;
    }
    stackData[index] = {
      ...entry,
      label: undefined,
      labelComponent: () => customLabel(label, index === keyIndexes[keyIndexes.length - 1]),
    };
  }
  for (const item of stackData) {
    item.label = undefined;
  }
  const xAxisHeight = 20;
  const yAxisWidth = 30;

  const maxValue = Math.max(goal.calories, ...stackData.map((item) => item.stacks.reduce((acc, curr) => acc + curr.value, 0)));
  const goalValue = goal.calories;
  const chartYStep = 500;
  const chartMaxValue = roundUpToStep(Math.max(maxValue, goalValue), chartYStep);
  const spacing = 1;
  const endSpacing = 8;
  return (
    <ThemedBlock>
    <View className="gap-m">
      <View className="flex-row gap-s items-center justify-between" onLayout={onLayout}>
        <ThemedText>Calorie Goal: {goal.calories.toFixed(0)}</ThemedText>
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
      <View className="h-30" onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
      <BarChart
          stackData={stackData}
          height={height - xAxisHeight}
          width={width - yAxisWidth}

          spacing={1}
          initialSpacing={0}
          endSpacing={10}
          barWidth={(width - yAxisWidth - (spacing * stackData.length - 1) - endSpacing) / stackData.length}

          xAxisLabelsHeight={xAxisHeight}
          yAxisColor={theme.text}
          xAxisColor={theme.text}
          rulesColor={theme.text + '09'}

          maxValue={chartMaxValue}
          stepValue={chartYStep}

          showReferenceLine1
          referenceLine1Position={goal.calories}
          referenceLine1Config={{
            color: customColors.calories,
            thickness: 1,
            dashWidth: 6,
            dashGap: 4,
          }}

          yAxisTextStyle={{
            color: theme.text,
            fontSize: 12,
            fontWeight: '500',
          }}

          xAxisLabelTextStyle={{
            color: theme.text,
            fontSize: 12,
            fontWeight: '500',
          }}
        />
      </View>
      <ThemedText>Deviation: {deviation.toFixed(0)} ({deviationPercentage}%)</ThemedText>
    </View>
  </ThemedBlock>
  );
};
