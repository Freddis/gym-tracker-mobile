export interface Progress {
  currentStageName: string,
  itemsDone: number,
  itemsNumber: number
  done: boolean
  error: boolean,
  message: string
}
