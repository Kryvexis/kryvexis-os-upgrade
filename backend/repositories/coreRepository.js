export function makeCoreRepository({ pool, table, idColumn = 'id' }) {
  return {
    async list(orderBy = idColumn) {
      const result = await pool.query(`select * from ${table} order by ${orderBy}`);
      return result.rows;
    },
    async getById(id) {
      const result = await pool.query(`select * from ${table} where ${idColumn} = $1 limit 1`, [id]);
      return result.rows[0] || null;
    },
    async count() {
      const result = await pool.query(`select count(*)::int as count from ${table}`);
      return result.rows[0]?.count || 0;
    }
  };
}
