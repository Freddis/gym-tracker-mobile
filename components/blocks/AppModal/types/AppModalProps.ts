import {ReactNode} from 'react';

export interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode | ReactNode[];
  customHeader?: ReactNode | ReactNode[];
};
