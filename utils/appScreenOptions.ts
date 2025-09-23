import {Colors} from '@/types/Colors';
import {NativeStackNavigationOptions} from '@react-navigation/native-stack';

export const appScreenOptions: NativeStackNavigationOptions = {
  headerShown: true,
  headerTitleStyle: {color: 'inherit'},
  headerTintColor: Colors.dark.accent,
};
