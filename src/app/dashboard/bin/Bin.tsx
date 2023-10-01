
'use client'

import styles from '@/styles/Dashboard.module.scss'
import { useFileListData } from "@/hooks"
import { FileType, ItemSize } from "@/enums"
import { LoadingOutlined, CloseCircleFilled } from '@ant-design/icons'
import DashboardLayout from "../DashboardLayout"
import FileItem from "../FileItem"

const RemovedFilesComponent: React.FC = () => {
  const {data: files, error, isLoading} = useFileListData(FileType.TRASH)

  if (isLoading) {
    return <span className={styles.filesComponentWrapper}><LoadingOutlined /> загрузка файлов...</span>
  }
  if (error) {
    return <span style={{color: '#d13434'}} className={styles.filesComponentWrapper}><CloseCircleFilled /> не удалось загрузить файлы</span>
  }

  let data: string | JSX.Element[] = 'Нет удаленных файлов'
  if (files && files.length > 0) {
    data = files.map(file => <FileItem key={file.uid} file={file} itemSize={ItemSize.S} />)
  }

  return <div className={styles.wrapReverse}>{data}</div>
}

const Component: React.FC = () => {
  return (
    <DashboardLayout>
      <RemovedFilesComponent />
    </DashboardLayout>
  )
}
export default Component