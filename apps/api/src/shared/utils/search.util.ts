import { Brackets, ObjectLiteral, SelectQueryBuilder } from 'typeorm';

/** `abc` → `%abc%`, with LIKE wildcards in the user's text escaped (Postgres' default escape is `\`). */
export const toContainsPattern = (search: string): string =>
  `%${search.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;

/**
 * Adds `AND (col1 ILIKE :search OR col2 ILIKE :search …)` when `search` is non-empty.
 * `columns` are query-builder expressions, e.g. `'users.displayName'` or `'CAST(users.id AS text)'`.
 */
export const applySearch = <T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  columns: string[],
  search?: string,
  paramName = 'search',
): SelectQueryBuilder<T> => {
  const term = search?.trim();
  if (!term || columns.length === 0) return qb;

  return qb.andWhere(
    new Brackets((where) => {
      columns.forEach((column) => where.orWhere(`${column} ILIKE :${paramName}`, { [paramName]: toContainsPattern(term) }));
    }),
  );
};
