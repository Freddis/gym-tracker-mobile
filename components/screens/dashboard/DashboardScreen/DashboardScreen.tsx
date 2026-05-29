import {Stack} from 'expo-router';
import {ScreenContainer} from '../../../blocks/ScreenContainer/ScreenContainer';
import {FC, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {LoadingBlock} from '../../../blocks/LoadingBlock/LoadingBlock';
import {useQuery} from '@tanstack/react-query';
import {queryClient} from '../../../../routes/_layout';
import {CalorieGoalBlock} from './components/CalorieGoalBlock';
import {useFocusOnce} from '../../../../hooks/useFocusOnce';
import {WeightGoalBlock} from './components/WeightGoalBlock';
import {WeightHistoryPeriod} from '../../../../utils/DashboardService/types/WeightHistoryPeriod';
import {AppWeightGoalStats} from '../../../../utils/DashboardService/types/AppWeightGoalStats';
import {AppCalorieGoalStats} from '../../../../utils/DashboardService/types/AppCalorieGoalStats';

export const DashboardScreen: FC = () => {
  const {dashboardService} = useServices();
  const [period, setPeriod] = useState<WeightHistoryPeriod>(WeightHistoryPeriod.month);
  const response = useQuery({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<{calorieGoal: AppCalorieGoalStats | null; weightGoals: Record<WeightHistoryPeriod, AppWeightGoalStats| null>;}> => {
      const calorieGoalPromise = dashboardService.getCalorieGoal();
      const weightGoalMonthPromise = dashboardService.getWeightGoal(WeightHistoryPeriod.month);
      const weightGoalHalfYearPromise = dashboardService.getWeightGoal(WeightHistoryPeriod.halfYear);
      const weightGoalYearPromise = dashboardService.getWeightGoal(WeightHistoryPeriod.year);
      const results = await Promise.all([
        calorieGoalPromise, weightGoalMonthPromise, weightGoalHalfYearPromise, weightGoalYearPromise]);
      return {
        calorieGoal: results[0],
        weightGoals: {
          [WeightHistoryPeriod.month]: results[1],
          [WeightHistoryPeriod.halfYear]: results[2],
          [WeightHistoryPeriod.year]: results[3],
        },
      };
    },
  });

  useFocusOnce(() => {
    console.log('invalidating dashboard');
    queryClient.invalidateQueries({queryKey: ['dashboard']});
  });

  if (!response.data || response.isLoading) {
    return (
    <ScreenContainer safeTop={true}>
      <LoadingBlock />
    </ScreenContainer>
    );
  }
  const calorieGoal = response.data.calorieGoal;
  const weightGoals = response.data.weightGoals;
  return (
    <ScreenContainer safeTop={true}>
      <Stack.Screen options={{title: 'Dashboard', headerShown: false}} />
      <ScrollView className="h-full">
        <View className="h-full p-s gap-m">
        {calorieGoal && <CalorieGoalBlock goal={calorieGoal} />}
        {weightGoals[period] && <WeightGoalBlock goal={weightGoals[period]} onChangePeriod={setPeriod} />}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};
