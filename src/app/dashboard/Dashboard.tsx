
'use client'

import styles from '@/styles/Dashboard.module.scss'
import React, { Fragment, ReactElement, useState } from 'react'
import {
  DeleteOutlined,
  PlusOutlined,
  LoadingOutlined,
  CloseCircleFilled,
  TableOutlined,
  AppstoreOutlined,
  BorderOutlined
} from '@ant-design/icons'
import { getExt, getFileId, isImage, merge, notifier, prepareFiles } from '@/functions'
import { useBinMutate, useFileListData, useUserData } from '@/hooks'
import { FileMSG, FileType, ItemSize, ItemFilter } from '@/enums'
import { MeDTO } from '@/dto'
import { File } from '@/api'
import { Popconfirm, Skeleton, Upload, Segmented, message, UploadFile, UploadProps } from 'antd'
import Selecto, { SelectoEvents } from 'selecto'
import DashboardLayout from './DashboardLayout'
import FileItem from './FileItem'
import { useFilesStore } from '@/state/files'

type D<T> = React.Dispatch<React.SetStateAction<T>>
type ActionsType = {download: VoidFunction, preview: VoidFunction, remove: VoidFunction}
type OnChangeParamType = Parameters<Exclude<UploadProps['onChange'], undefined>>[0]
type Listener<E extends keyof SelectoEvents> = Parameters<typeof Selecto.prototype.on<E>>[1]

const removeFiles = async(ids: number[]) => {
  try {
    const data = await File.remove(ids)
    message.success(FileMSG.REMOVEE)
    return true
  }
  catch(_: any) {
    message.error(FileMSG.FAILR + _.message)
    return false
  }
}

const initSelection = (setSelected: D<number[]>) => {
  const container = document.querySelector<HTMLElement>('body')!
  const filter = (selected: number[], ids: number[]) => selected.filter(id => !ids.includes(id))
  const selecto = new Selecto({
    container: container,
    dragContainer: document.querySelector('.' + styles.wrapReverse),
    selectableTargets: [`.${styles.selectableItem}`],
    selectFromInside: true,
    selectByClick: false,
    continueSelect: false,
    toggleContinueSelect: ['shift'],
    hitRate: 0,
    ratio: 0,
    scrollOptions: {container, threshold: 30}
  })
  const select: Listener<'select'> = event => {
    if (event.added.length) {
      const addedMapped = event.added.map(item => {
        item.classList.add(styles.selected)
        return Number(item.dataset.itemId)
      })
      setSelected(selected => [...selected, ...addedMapped])
    }
    if (event.removed.length) {
      const removedMap = event.removed.map(item => {
        item.classList.remove(styles.selected)
        return Number(item.dataset.itemId)
      })
      setSelected(selected => filter(selected, removedMap))
    }
  }
  const scroll: Listener<'scroll'> = event => {
    document.documentElement.scrollBy(event.direction[0] * 10, event.direction[1] * 10)
  }
  return selecto.on('select', event => select(event)).on('scroll', event => scroll(event))
}

interface FileUploaderProps {}
const FileUploader: React.FC<FileUploaderProps> = React.memo((props) => {
  const mergeFileList = useFilesStore(state => state.mergeFileList)
  const [files, setFiles] = useState<UploadFile[]>([])
  const size = ItemSize.S
  const itemRender = (originNode: ReactElement, file: UploadFile, fileList: object[], actions: ActionsType) => <FileItem file={file} itemSize={size} />
  const onChange = ({fileList, file}: OnChangeParamType) => setFiles(fileList)
  const beforeUpload: UploadProps['beforeUpload'] = file => {
    const fiveMbInBytes = 1024 * 1024 * 5
    if (file.size > fiveMbInBytes) {
      message.error(FileMSG.OVERSIZE)
      return Upload.LIST_IGNORE
    }
  }
  const customRequest: UploadProps['customRequest'] = async(options) => {
    try {
      const {status, body} = await File.upload(options)
      notifier('success', 'OK', FileMSG.LOADED)
    }
    catch(_: any) {
      notifier('error', FileMSG.FAIL, _.message)
    }
  }
  React.useEffect(() => {
    let uploadedFiles: UploadFile[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const status = file.status!
      if (status === 'done') {
        uploadedFiles.push(file)
      }
    }
    if (uploadedFiles.length !== 0) {
      const ids = uploadedFiles.map(file => file.uid)
      setFiles(files => files.filter(file => !ids.includes(file.uid)))
      mergeFileList(uploadedFiles)
    }
  }, [files])
  return <Upload
    fileList={files}
    beforeUpload={beforeUpload}
    customRequest={customRequest}
    itemRender={itemRender}
    onChange={onChange}
    listType="picture-card">
      <div className={styles.uploadChild} style={{width: size, height: size}}><PlusOutlined />&nbsp;ЗАГРУЗИТЬ</div>
  </Upload>
})

interface FileListProps {
  itemSize: number
  itemFilter: ItemFilter
}
const FileList: React.FC<FileListProps> = React.memo((props) => {
  const mergeBin = useBinMutate().merge
  const fileList = useFilesStore(state => state.fileList)
  const removeFromFileList = useFilesStore(state => state.removeFromFileList)
  const {itemSize, itemFilter} = props
  const isItemFilterImage = itemFilter === ItemFilter.IMAGE
  const onItemRemove = async(file: UploadFile) => {
    const uid = getFileId(file)
    const removed = await removeFiles([uid])
    if (removed) {
      removeFromFileList([uid])
      mergeBin([file])
      return true
    }
    else {
      return false
    }
  }
  let list = null
  if (isItemFilterImage) {
    list = fileList.filter(file => isImage(getExt(file))).map(file => <FileItem key={file.uid} file={file} itemSize={itemSize} onItemRemove={() => onItemRemove(file)} />)
  }
  else {
    list = fileList.map(file => <FileItem key={file.uid} file={file} itemSize={itemSize} onItemRemove={() => onItemRemove(file)} />)
  }
  return <div className={styles.wrapReverse}>{list}</div>
})

interface SegmentsProps {
  selected: number[]
  itemSize: ItemSize
  itemFilter: ItemFilter
  setSelected: D<number[]>
  setItemFilter: D<ItemFilter>
  setItemSize: D<ItemSize>
}
const Segments: React.FC<SegmentsProps> = React.memo((props) => {
  const mergeBin = useBinMutate().merge
  const fileList = useFilesStore(state => state.fileList)
  const removeFromFileList = useFilesStore(state => state.removeFromFileList)
  const {selected, itemSize, itemFilter, setSelected, setItemFilter, setItemSize} = props
  const cancel = () => {}
  const confirm = async () => {
    const removed = await removeFiles(selected)
    if (removed) {
      removeFromFileList(selected)
      mergeBin(fileList.filter(file => selected.includes(getFileId(file))))
      setSelected([])
      return true
    }
    else {
      return false
    }
  }
  const SL = selected.length
  if (SL > 0) {
    const confirmElement = <Popconfirm
      title={FileMSG.REMOVET}
      description={FileMSG.REMOVED}
      onConfirm={confirm}
      onCancel={cancel}
      okText={FileMSG.Y}
      cancelText={FileMSG.N}><DeleteOutlined /></Popconfirm>
    return <div className={styles.segmentedWrapper}>Выбрано элементов: {SL} {confirmElement}</div>
  }
  if (SL === 0) {
    return <div className={styles.segmentedWrapper}>
      <Segmented
        options={[{label: 'все файлы', value: ItemFilter.ALL}, {label: 'картинки', value: ItemFilter.IMAGE}]}
        value={itemFilter}
        onChange={value => setItemFilter(+value)}
        className={styles.segmented} />
      <Segmented
        options={[{icon: <TableOutlined />, value: ItemSize.S}, {icon: <AppstoreOutlined />, value: ItemSize.M},  {icon: <BorderOutlined />, value: ItemSize.L}]}
        value={itemSize}
        onChange={value => setItemSize(+value)}
        className={styles.segmented} />
    </div>
  }
})

const FilesManager: React.FC = () => {
  const initialized = useFilesStore(state => state.initialized)
  const setInitialized = useFilesStore(state => state.setInitialized)
  const setFileList = useFilesStore(state => state.setFileList)
  const [selected, setSelected] = useState<number[]>([])
  const [itemSize, setItemSize] = useState<ItemSize>(ItemSize.M)
  const [itemFilter, setItemFilter] = useState<ItemFilter>(ItemFilter.ALL)
  const {data: files, error, isLoading} = useFileListData(FileType.ALL)

  React.useEffect(() => {
    const sevent = 'scroll'
    let selectoInstance: undefined | Selecto = undefined
    let seventHandler = () => selectoInstance!.checkScroll()
    if (!files) return
    if (!initialized) {
      setInitialized(true)
      setFileList(files)
      return
    }
    selectoInstance = initSelection(setSelected)
    document.addEventListener(sevent, seventHandler)
    return () => {
      if (selectoInstance) {
        selectoInstance.destroy()
        document.removeEventListener(sevent, seventHandler)
      }
    }
  }, [files, initialized])

  if (isLoading) {
    return <div className={styles.filesComponentWrapper}>
      <div><LoadingOutlined /> загрузка файлов...</div>
    </div>
  }
  if (error) {
    return <div style={{color: '#d13434'}} className={styles.filesComponentWrapper}>
      <div><CloseCircleFilled /> не удалось загрузить файлы</div>
    </div>
  }

  return <div className={styles.filesComponentWrapper}>
    <h2>файлы</h2>
    <Segments {...{itemSize, itemFilter, selected, setSelected, setItemFilter, setItemSize}} />
    <FileUploader />
    <FileList {...{itemSize, itemFilter}} />
  </div>
}

const UserData: React.FC = () => {
  const {data, error, isLoading} = useUserData()
  if (isLoading) return <div className={styles.userData}><Skeleton active /></div>
  if (error) return <div className={styles.userData}>Не удалось загрузить данные пользователя</div>
  const {email, fullname, id, password} = data!
  return <div className={styles.userData}>
    <h2>профиль</h2>
    <div>ID: <b>{id}</b></div>
    <div>Полное имя: <b>{fullname}</b></div>
    <div>E-Mail: <b>{email}</b></div>
    <div>Пароль: <b>{password}</b></div>
  </div>
}

const Component: React.FC = () => <DashboardLayout>
  <Fragment>
    <UserData />
    <FilesManager />
  </Fragment>
</DashboardLayout>

export default Component