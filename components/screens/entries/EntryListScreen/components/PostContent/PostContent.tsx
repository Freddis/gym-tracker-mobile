import {FC} from 'react';
import {ThemedImage} from '../../../../../blocks/ThemedImage/ThemedImage';
import {ThemedText} from '../../../../../blocks/ThemedText/ThemedText';
import {AppEntry} from '../../../../../../types/models/AppEntry';
import {useServices} from '../../../../../providers/ServiceProvider/ServiceProvider';

export const PostContent: FC<{entry: AppEntry}> = (props) => {
  const {entryAtomService} = useServices();
  const image = entryAtomService.getImageSource(props.entry);
  return (
    <>
      {props.entry.title && (
        <ThemedText className="font-semibold">
          {props.entry.title}
        </ThemedText>
      )}
      {props.entry.note && <ThemedText>{props.entry.note}</ThemedText>}
      {image && (
        <ThemedImage source={{uri: image}} className="w-full h-80 mt-s"/>
      )}
    </>
  );
};
