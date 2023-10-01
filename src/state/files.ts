import { getFileId, merge } from '@/functions'
import { UploadFile } from 'antd'
import {create} from 'zustand'

interface FilesStore {
  initialized: boolean
  fileList: UploadFile[]
  removeFromFileList: (ids: number[]) => void
  setInitialized: (value: boolean) => void
  setFileList: (list: UploadFile[]) => void
  mergeFileList: (list: UploadFile[]) => void
}
export const useFilesStore = create<FilesStore>()(set => ({
  initialized: false,
  fileList: [],
  removeFromFileList: ids => set(state => ({fileList: state.fileList.filter(file => !ids.includes(getFileId(file)))})),
  setInitialized: value => set(state => ({initialized: value})),
  setFileList: list => set(state => ({fileList: list})),
  mergeFileList: list => set(state => ({fileList: merge<UploadFile>(state.fileList, list)}))
}))