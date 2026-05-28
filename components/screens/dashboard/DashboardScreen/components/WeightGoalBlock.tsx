import {LayoutChangeEvent, View} from 'react-native';
import {ThemedBlock} from '../../../../blocks/ThemedBlock/ThemedBlock';
import {ThemedText} from '../../../../blocks/ThemedText/ThemedText';
import {LineChart, lineDataItem} from 'react-native-gifted-charts';
import {CSSProperties, FC, useState} from 'react';
import {useAppTheme} from '../../../../../hooks/useAppTheme';
import {WeightAppEntry} from '../../../../../types/models/AppEntry';
import {cn} from '../../../../../cn';
function getFirstLastAndMiddleIndexes(length: number, x: number) {
  if (length <= 0) return [];
  if (length === 1) return [0];

  const result = [0];
  const last = length - 1;

  const step = last / (x + 1);

  for (let i = 1; i <= x; i++) {
    const index = Math.round(step * i);
    result.push(index);
  }

  result.push(last);

  return [...new Set(result)];
}
export const customColors = {
  carbs: '#22c55e',
  protein: '#3b82f6',
  fat: '#eab308',
  calories: '#ef4444',
} as const satisfies Record<string, Exclude<CSSProperties['color'], undefined>>;

interface WeightGoalBlockProps {
  history: WeightAppEntry[];
}
export const WeightGoalBlock:FC<WeightGoalBlockProps> = (props) => {
  const {history} = props;
  const theme = useAppTheme();
  const [width, setWidth] = useState(50);
  const [height, setHeight] = useState(100);

  const customLabel = (val: string, last?: boolean) => {
    return (
        <View className={cn('w-10', last ? '-ml-4' : '-ml-4')}>
            <ThemedText style={{color: 'white', fontWeight: 'bold', fontSize: 10}}>{val}</ThemedText>
        </View>
    );
  };

  const buildWeightChartData = (
    history: WeightAppEntry[],
    historySize: number,
    endDate: Date = new Date()
  ): lineDataItem[] => {
    const HOUR = 1000 * 60 * 60;
    const DAYS = historySize;
    const from = endDate.getTime();
    const to = from - DAYS * 24 * HOUR;

  // Sort ascending
    const weights = [...history].sort(
    (a, b) => a.time.getTime() - b.time.getTime()
  );
    const values: lineDataItem[] = [];
    let weightIndex = 0;
    let currentWeight: WeightAppEntry | undefined;
    for (let time = to; time <= from; time += HOUR) {
      const currentDate = new Date(time);

     // Advance weights while entries are before current hour
      let weight = weights[weightIndex];
      while (weight && weight.time.getTime() <= time) {
        currentWeight = weight;
        weightIndex++;
        weight = weights[weightIndex];
      }

      // Show label only once per day
      const day = currentDate.getDate().toString().padStart(2, '0');
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const label = `${day}/${month}`;
      if (!currentWeight) {
        continue;
      }
      values.push({
        value: currentWeight?.weight.weight,
        label: label,
      });
      currentWeight = undefined;
    }
    return values;
  };

  const createKeyPoint = (label:string, val: string, last?: boolean) => {
    const result: lineDataItem = {
      value: parseFloat(val),
      labelComponent: () => customLabel(label, last),
      showStrip: true,
      stripColor: theme.text,
      stripOpacity: 0.1,
      stripWidth: 0.5,
      stripHeight: height,
      dataPointLabelShiftY: -50,
    };
    if (last) {
      result.dataPointLabelComponent = () => {
        return (
            <View className="w-10 bg-black p-1 text-center">
            <ThemedText className="text-sm text-white">{val}</ThemedText>
            </View>
        );
      };
    }
    return result;
  };

  const data = buildWeightChartData(history, 30);
  const keyIndexes = getFirstLastAndMiddleIndexes(data.length, 3);
  for (const index of keyIndexes) {
    const entry = data[index];
    if (!entry || !entry.label || !entry.value) {
      continue;
    }
    data[index] = createKeyPoint(
      entry.label,
      entry.value.toFixed(1),
      index === keyIndexes[keyIndexes.length - 1]
    );
  }
  for (const item of data) {
    item.label = undefined;
  }
  const pad = 2;
  for (let i = 0; i < pad; i++) {
    data.push({
      value: undefined,
      label: undefined,
    });
  }

  const lineColor = '#177AD5';
  const minValue = Math.min(...data.map((item) => item.value ?? 10000000));
  const maxValue = Math.max(...data.map((item) => item.value ?? 0));
  const offset = 0.01;
  const yAxisOffset = Math.floor(minValue - minValue * offset);
  const yAxisMaxOffset = Math.ceil(maxValue + maxValue * offset);
  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
    setHeight(event.nativeEvent.layout.height);
  };
  const yAxisWidth = 30;
  const xAxisHeight = 20;

  return (
    <ThemedBlock>
    <View className="gap-m">
      <View className="flex-row gap-s items-center justify-between">
        <ThemedText>Weight Goal</ThemedText>
      </View>
      <View className="flex-row h-60 justify-between" onLayout={onLayout}>
        <LineChart
        curved
        curvature={0.4}
        extrapolateMissingValues={false}

        showDataPointsForMissingValues={false}
        // hideRules
        yAxisOffset={yAxisOffset}
        maxValue={yAxisMaxOffset - yAxisOffset}
        thickness={3}
        dataPointsRadius={4}
        data = {data}
        height={height - xAxisHeight}
        width={width - yAxisWidth}
        xAxisLabelsHeight={xAxisHeight}
        xAxisLabelsAtBottom
        yAxisLabelWidth={yAxisWidth}
        color={lineColor}
        dataPointsColor={lineColor}
        textColor={theme.text}
        yAxisColor={theme.text}
        xAxisColor={theme.text}
        rulesColor={theme.text + '09'}
        rulesType="solid"
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
        noOfSections={8}
        adjustToWidth
        />

      </View>
    </View>
  </ThemedBlock>
  );
};
