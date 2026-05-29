export const getFirstLastAndMiddleIndexes = (length: number, x: number) => {
  if (length <= 0) return [];
  if (length === 1) return [0];

  const result = [0];
  const last = length - 1;

  const step = last / (x + 1);

  for (let i = 1; i <= x; i++) {
    const index = Math.round(step * i);
    result.push(index);
  }

  result.push(last);

  return [...new Set(result)];
};
