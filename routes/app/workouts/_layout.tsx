import {AppErrorBoundary} from '@/components/AppErrorBoundary/AppErrorBoundary';
import {Stack} from 'expo-router';

export default function WorkoutsLayout() {
  return (
    <AppErrorBoundary>
      <Stack screenOptions={{headerShown: false}} />
    </AppErrorBoundary>
  );
}
