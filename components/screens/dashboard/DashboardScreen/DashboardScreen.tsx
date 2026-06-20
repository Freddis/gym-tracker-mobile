import {Stack} from 'expo-router';
import {AppScreenContainer} from '../../../blocks/AppScreenContainer/AppScreenContainer';
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
import {useUser} from '../../../providers/AuthProvider/useUser';
import {ThemedText} from '../../../blocks/ThemedText/ThemedText';
import {ThemedBlock} from '../../../blocks/ThemedBlock/ThemedBlock';

export const DashboardScreen: FC = () => {
  const {dashboardService} = useServices();
  const user = useUser();
  const [period, setPeriod] = useState<WeightHistoryPeriod>(WeightHistoryPeriod.month);
  const response = useQuery({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<{calorieGoal: AppCalorieGoalStats | null; weightGoals: Record<WeightHistoryPeriod, AppWeightGoalStats| null>;}> => {
      const calorieGoalPromise = dashboardService.getCalorieGoal(user);
      const weightGoalMonthPromise = dashboardService.getWeightGoal(user, WeightHistoryPeriod.month);
      const weightGoalHalfYearPromise = dashboardService.getWeightGoal(user, WeightHistoryPeriod.halfYear);
      const weightGoalYearPromise = dashboardService.getWeightGoal(user, WeightHistoryPeriod.year);
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
    <AppScreenContainer safeTop={true}>
      <LoadingBlock />
    </AppScreenContainer>
    );
  }
  const calorieGoal = response.data.calorieGoal;
  const weightGoals = response.data.weightGoals;
  const hasNoGoals = Object.values(weightGoals).every((goal) => !goal) && !calorieGoal;
  return (
    <AppScreenContainer safeTop={true}>
      <Stack.Screen options={{title: 'Dashboard', headerShown: false}} />
      <ScrollView className="h-full">
        <View className="h-full p-s gap-m">
        {calorieGoal && <CalorieGoalBlock goal={calorieGoal} />}
        {weightGoals[period] && <WeightGoalBlock goal={weightGoals[period]} onChangePeriod={setPeriod} />}
        {hasNoGoals && (
          <ThemedBlock>
            <ThemedText>No goals added. Add goals and entries to see your progress</ThemedText>
          </ThemedBlock>
        )}
        </View>
      </ScrollView>
    </AppScreenContainer>
  );
};
