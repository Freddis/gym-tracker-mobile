import {View, type ViewProps} from 'react-native';

type ThemedViewProps = ViewProps

export function ThemedView({className, ...otherProps}: ThemedViewProps) {
  return <View className={className} {...otherProps} />;
}
