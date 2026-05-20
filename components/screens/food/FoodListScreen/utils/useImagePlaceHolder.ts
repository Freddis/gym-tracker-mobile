

export const useImagePlaceHolder = (square?: boolean): string => {
  const noImageLabel = 'No Image'.replaceAll(' ', '+');
  const size = square ? '600x600' : '600x400';
  return `https://dummyimage.com/${size}/000/fff&text=${noImageLabel}`;
};
