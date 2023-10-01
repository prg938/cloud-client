import useSWR, { useSWRConfig } from "swr"
import {FileType} from '@/enums'
import {File, User} from '@/api'
import {UploadFile} from "antd"
import {MeDTO} from "./dto"

const useUserData = () => {
  const {data, error, isLoading} = useSWR<MeDTO>('/users/me', User.me, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
  return {data, error, isLoading}
}

const useFileListData = (type: FileType) => {
  const {data, error, isLoading} = useSWR(['/files', type], File.get, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
  return {data, error, isLoading}
}

const useBinMutate = () => {
  const {mutate} = useSWRConfig()
  return {
    merge: (list: UploadFile[]) => mutate<UploadFile[]>(['/files', FileType.TRASH], files => { return [...files!, ...list] }, {revalidate: false})
  }
}

export {useUserData, useFileListData, useBinMutate}