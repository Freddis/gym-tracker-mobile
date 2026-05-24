import {FC} from 'react';
import {View} from 'react-native';
import {cn} from '../../../cn';

export const AppSeparator: FC<{noMargin?: boolean}> = (props) => {
  const {noMargin} = props;
  return (
    <View className={cn('border-b border-cavity/50', noMargin ? '' : 'mt-s mb-s')} />
  );
};
