import {ScrollView, ScrollViewProps} from 'react-native';
import {forwardRef, Ref} from 'react';

type ThemedScrollViewProps = ScrollViewProps

export const ThemedScrollView = forwardRef(
  function ThemedScrollViewBase({className, ...otherProps}: ThemedScrollViewProps, ref: Ref<ScrollView>) {
    return <ScrollView ref={ref} className={className} {...otherProps} />;
  }
);
