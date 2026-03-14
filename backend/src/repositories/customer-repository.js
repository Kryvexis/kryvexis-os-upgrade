import { BaseRepository } from './base-repository.js';

export class CustomerRepository extends BaseRepository {
  constructor() {
    super('customers', ['id', 'name', 'owner', 'branch_id', 'status', 'balance', 'contact_email', 'phone', 'notes', 'created_at']);
  }
}
