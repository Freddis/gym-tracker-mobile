import {ScreenContainer} from '../../blocks/ScreenContainer/ScreenContainer';
import {ThemedText} from '../../blocks/ThemedText/ThemedText';
import {Stack} from 'expo-router';

export const FoodListScreen = () => {
  return (
    <ScreenContainer>
      <Stack.Screen options={{title: 'Food List', headerShown: true}} />
      <ThemedText>Food List</ThemedText>
    </ScreenContainer>
  );
};
