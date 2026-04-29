export interface Progress {
  currentStageName: string,
  itemsInProgress: number,
  itemsNumber: number,
  subItemsDone?: number,
  subItemsNumber?: number,
  done: boolean
  error: boolean,
  message: string
}
