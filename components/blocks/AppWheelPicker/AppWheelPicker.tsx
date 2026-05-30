import {styled} from 'nativewind';
import WheelPicker from '@quidone/react-native-wheel-picker';
import {PickerItem, PickerProps} from '@quidone/react-native-wheel-picker/dest/typescript/base';
import {FC} from 'react';

const NativeWindWheelPicker = styled(WheelPicker, {
  className: 'style',
  overlayItemClassName: 'overlayItemStyle',
  itemTextClassName: 'itemTextStyle',
  contentContainerClassName: 'contentContainerStyle',
});
interface AppWheelPickerProps extends Omit<PickerProps<PickerItem<string>>, 'style'|'itemTextStyle'|'overlayItemStyle'|'contentContainerStyle'> {
  className?: string;
  overlayItemClassName?: string;
  itemTextClassName?: string;
  contentContainerClassName?: string;

}
export const AppWheelPicker: FC<AppWheelPickerProps> = (props) => {
  return <NativeWindWheelPicker {...props} />;
};
