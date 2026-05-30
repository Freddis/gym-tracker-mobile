import {EntryVisibility} from '../../../openapi-client';

export interface EntryCreateParams {
  image?: string
  note?: string
  title?: string,
  visibility?: EntryVisibility,
  time?: Date,
}
