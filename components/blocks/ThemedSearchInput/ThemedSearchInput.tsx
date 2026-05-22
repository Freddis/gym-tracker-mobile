import {FC, useState} from 'react';

import {ZodTypeAny} from 'zod';
import {ThemedTextInput, ThemedTextInputProps} from '../ThemedInput/ThemedInput';

interface ThemedSearchInputProps extends ThemedTextInputProps {
  onSearch: (value:string | null) => void,
  debounce?: number
  minLength?: number
  validator?: ZodTypeAny
}
export const ThemedSearchInput: FC<ThemedSearchInputProps> = (props) => {
  const {minLength = 3, debounce = 1000, validator, onSearch, ...rest} = props;
  const [searchValue, setSearchValue] = useState(props.value ?? '');
  const hasError = validator && searchValue !== '' && !validator.safeParse(searchValue).success;
  const [timeoutHandle, setTimeoutHandle] = useState<string>();
  const onChange: ThemedSearchInputProps['onChangeText'] = (e) => {

    const trimmed = e.trim();
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
    setSearchValue(e);
    if (trimmed.length < minLength) {
      const timeout = setTimeout(() => {
        onSearch(null);
      }, debounce);

      setTimeoutHandle(timeout as any);
      return;
    }

    const timeout = setTimeout(() => {
      onSearch(trimmed);
    }, debounce);

    setTimeoutHandle(timeout as any);
  };

  return <ThemedTextInput {...rest} type={hasError ? 'dangerText' : undefined} onChangeText={onChange} value={searchValue} />;
};
