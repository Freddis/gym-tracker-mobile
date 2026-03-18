import * as api from '@/openapi-client';

export class ApiService {
  protected api: typeof api;

  constructor() {
    this.api = api;
  }

  client(): typeof api {
    return this.api;
  }
}
