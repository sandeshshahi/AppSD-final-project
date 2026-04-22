export const parseId = (id: string | number): number => {
  const parsed = typeof id === "string" ? parseInt(id, 10) : id;
  if (isNaN(parsed)) throw new Error("Invalid ID format");
  return parsed;
};
