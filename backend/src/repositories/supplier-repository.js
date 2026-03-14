import { BaseRepository } from './base-repository.js';

export class SupplierRepository extends BaseRepository {
  constructor() {
    super('suppliers', ['id', 'name', 'category', 'lead_time_days', 'status', 'contact_email', 'created_at']);
  }
}
