export const dateToString = (date: Date, includeTime: boolean = true):string => {
  return [
    date.toLocaleDateString(),
    includeTime ? [
      date.getHours().toString().padStart(2, '0'),
      date.getMinutes().toString().padStart(2, '0'),
    ].join(':') : '',
  ].join(' ');
};
