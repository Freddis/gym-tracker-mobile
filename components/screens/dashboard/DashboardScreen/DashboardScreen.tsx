import {Stack} from 'expo-router';
import {ScreenContainer} from '../../../blocks/ScreenContainer/ScreenContainer';
import {FC} from 'react';
import {ScrollView, View} from 'react-native';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {LoadingBlock} from '../../../blocks/LoadingBlock/LoadingBlock';
import {useQuery} from '@tanstack/react-query';
import {queryClient} from '../../../../routes/_layout';
import {CalorieGoalBlock} from './components/CalorieGoalBlock';
import {useFocusOnce} from '../../../../hooks/useFocusOnce';
import {WeightGoalBlock} from './components/WeightGoalBlock';

export const DashboardScreen: FC = () => {
  const {dashboardService} = useServices();
  const response = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const calorieGoalPromise = dashboardService.getCalorieGoal();
      const weightGoalPromise = dashboardService.getWeightGoal();
      const [calorieGoal, weightGoal] = await Promise.all([calorieGoalPromise, weightGoalPromise]);
      return {
        calorieGoal,
        weightGoal,
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
  const weightGoal = response.data.weightGoal;
  return (
    <ScreenContainer safeTop={true}>
      <Stack.Screen options={{title: 'Dashboard', headerShown: false}} />
      <ScrollView className="h-full">
        <View className="h-full p-s gap-m">
        {calorieGoal && <CalorieGoalBlock consumedCalories={calorieGoal.consumedCalories} goal={calorieGoal.goal} />}
        {weightGoal && <WeightGoalBlock history={weightGoal.history} />}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};
