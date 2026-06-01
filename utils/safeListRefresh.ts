import {Alert} from 'react-native';
import {waitBeforeExecution} from './waitBeforeExecution';

export const safeListRefresh = async (setter: (value: boolean) => void, errorMessage: string, callback: () => Promise<void>) => {
  const startTime = new Date();
  const animationTimeout = 1500;
  try {
    setter(true);
    await callback();
    await waitBeforeExecution(startTime, animationTimeout, async () => setter(false));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    await waitBeforeExecution(startTime, animationTimeout, async () => {
      Alert.alert('Error', errorMessage);
      setter(false);
    });
  }
};
