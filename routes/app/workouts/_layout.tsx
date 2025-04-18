import {AppErrorBoundaryScreen} from '@/components/screens/common/AppErrorBoundaryScreen/AppErrorBoundaryScreen';
import {Stack} from 'expo-router';

export default function WorkoutsLayout() {
  return (
    <AppErrorBoundaryScreen>
      <Stack screenOptions={{headerShown: false}} />
    </AppErrorBoundaryScreen>
  );
}
