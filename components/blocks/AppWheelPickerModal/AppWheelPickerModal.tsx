import {FC} from 'react';
import {AppModalProps} from '../AppModal/types/AppModalProps';
import {AppModal} from '../AppModal/AppModal';
import {View} from 'react-native';

export const AppWheelPickerModal: FC<AppModalProps> = (props) => {
  const {children, ...modalProps} = props;
  return (
    <AppModal {...modalProps}>
      <View className="pb-20 w-full overflow-hidden">
        {children}
      </View>
    </AppModal>
  );
};
