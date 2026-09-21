import {AppErrorBoundaryScreen} from '@/components/screens/common/AppErrorBoundaryScreen/AppErrorBoundaryScreen';
import {appScreenOptions} from '@/utils/appScreenOptions';
import {Stack} from 'expo-router';

export default function DashboardLayout() {
  return (
    <AppErrorBoundaryScreen>
      <Stack screenOptions={appScreenOptions} />
    </AppErrorBoundaryScreen>
  );
}
