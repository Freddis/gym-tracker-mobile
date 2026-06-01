export const waitBeforeExecution = async (start: Date, timeOutMs: number, callback: () => Promise<void>) => {
  const end = Date.now();
  const duration = end - start.getTime();
  const timeout = Math.max(0, timeOutMs - duration);
  setTimeout(callback, timeout);
};
