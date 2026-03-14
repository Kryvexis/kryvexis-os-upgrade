import { BaseRepository } from './base-repository.js';

export class ProductRepository extends BaseRepository {
  constructor() {
    super('products', ['id', 'sku', 'name', 'branch_id', 'status', 'stock', 'reorder_at', 'price', 'cost', 'supplier_id', 'created_at']);
  }
}
