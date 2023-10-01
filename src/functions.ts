import { BaseAPI } from "@/api"
import { FileEntity } from "@/dto"
import { UploadFile, notification } from "antd"

export const merge = <T>(array1: T[], array2: T[]) => {
  return [...array1, ...array2]
}

export const getExt = (file: UploadFile) => file.name.split('.').pop() || String()

export const getFileId = (file: UploadFile) => {
  if (!isNaN(Number(file.uid))) return Number(file.uid)
  if (file.response) return JSON.parse(file.response.body).id
  return file.uid
}

export const prepareFiles = (files: FileEntity[]) => {
  const fileList: UploadFile[] = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const {id, filename, mimeType, deletedAt, size, originalName, user} = file
    fileList.push({status: 'done', uid: String(id), name: originalName, size, type: mimeType, preview: BaseAPI.endpointUploadsURL + filename})
  }
  return fileList
}

export const resolveSize = (size: number): string => {
  let value = size / 1024
  let postfix = 'Kb'
  if (value >= 1000) {
    value = value / 1024
    postfix = 'Mb'
  }
  return value.toFixed(1) + postfix
}

export const getBase64 = (file: File): Promise<string> =>
new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => resolve(reader.result as string)
  reader.onerror = (error) => reject(error)
})

export const isImage = (ext: string) => ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'svg' || ext === 'gif'

export const notifier = (type: 'success' | 'error', message: string, description: string, duration: number = 2) => {
  notification[type]({
    message,
    description,
    duration
  })
}