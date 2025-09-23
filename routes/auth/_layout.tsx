import {appScreenOptions} from '@/utils/appScreenOptions';
import {Stack} from 'expo-router';

export default function HomeLayout() {
  return <Stack screenOptions={appScreenOptions} />;
}
