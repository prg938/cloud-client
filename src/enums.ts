
export enum ItemSize {S = 110, M = 170, L = 220}

export enum ItemFilter {ALL, IMAGE}

export enum FileType {
  PHOTOS = "photos",
  TRASH = "trash",
  ALL = 'all'
}
export enum FileMSG {
  Y = 'Да',
  N = 'Нет',
  ABORT = 'загрузка прервалась',
  FAIL = 'не удалось загрузить файл(ы)',
  FAILR = 'не удалось удалить файл(ы)',
  OVERSIZE = 'файл более 5Mb недопустим',
  REMOVET = 'удаление',
  REMOVED = 'уверены что хотите удалить?',
  REMOVEE = 'удалено',
  LOADED = 'файл загрурен'
}