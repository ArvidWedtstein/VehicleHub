export const pick = <
  T extends object | Record<string, unknown>,
  K extends keyof T,
>(
  obj: T,
  keys: K[],
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
};

export const omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj } as Omit<T, K>;
  for (const key of keys) {
    delete (result as any)[key];
  }
  return result;
};
