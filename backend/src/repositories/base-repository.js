import { query } from '../lib/db.js';

export class BaseRepository {
  constructor(tableName, columns) {
    this.tableName = tableName;
    this.columns = columns;
  }

  async list(limit = 100) {
    const sql = `select ${this.columns.join(', ')} from ${this.tableName} order by created_at desc nulls last, id asc limit $1`;
    const result = await query(sql, [limit]);
    return result.rows;
  }

  async getById(id) {
    const result = await query(`select ${this.columns.join(', ')} from ${this.tableName} where id = $1 limit 1`, [id]);
    return result.rows[0] || null;
  }
}
