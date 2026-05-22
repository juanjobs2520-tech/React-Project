export const paginate = <T,>(items: T[], page: number, pageSize: number): T[] => {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
};

export const filterByText = <T extends Record<string, unknown>>(
  items: T[],
  query: string,
  keys: (keyof T)[]
): T[] => {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) =>
    keys.some((key) => String(item[key] ?? '').toLowerCase().includes(q))
  );
};
