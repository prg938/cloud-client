
import styles from '@/styles/Dashboard.module.scss'
import { Popconfirm, Tooltip, UploadFile } from "antd"
import {
  DeleteOutlined,
  LoadingOutlined,
} from '@ant-design/icons'
import { BaseAPI } from '@/api'
import { getExt, getFileId, isImage, resolveSize } from '@/functions'
import { FileMSG, ItemSize } from '@/enums'

interface FileItemProps {
  file: UploadFile
  itemSize: ItemSize
  onItemRemove?: () => void
}
const FileItem: React.FC<FileItemProps> = ({file, itemSize, onItemRemove}) => {
  const {svg: SVG, image: IMAGE} = styles
  let preview = file.preview
  const status = file.status!
  const isFileUploading = status === 'uploading'
  const size = resolveSize(file.size!)
  const ext = getExt(file)
  const id = getFileId(file)
  const type = file.type
  const name = file.name
  const percent = file.percent
  const error = file.error
  const cancel = () => {}
  const confirm = onItemRemove
  const filenameElement = <Tooltip title={name} arrow={false} placement="top"><span className={styles.fileFilename}>{name}</span></Tooltip>
  let sizeElement: React.JSX.Element | null = <span className={styles.fileSize}>{size}</span>
  let typeElement: React.JSX.Element | null = <span className={styles.fileType}>{ext}</span>
  let previewLink = null
  let iconRemove = null
  let iconUploading = null
  let errorElement = null
  let itemStyle = {width: itemSize, height: itemSize} as any
  let previewClass = String()

  if (isFileUploading) {
    previewClass = SVG
    iconUploading = <span>({Math.ceil(percent as number)}%) <LoadingOutlined /></span>
  }

  if (!isFileUploading) {
    if (error) {
      errorElement = <span style={{color: '#d13434'}}>{error?.message}</span>
      previewClass = SVG
    }
    else {
      if (!preview) {
        try { preview = BaseAPI.endpointUploadsURL + JSON.parse(file.response.body).filename }
        catch (_) { console.error(_) }
      }
      if (isImage(ext.toLowerCase())) {
        previewClass = IMAGE
        itemStyle.backgroundImage = `url(${preview})`
      }
      else {
        previewClass = SVG
      }
      if (typeof onItemRemove === 'function') {
        iconRemove = <Popconfirm title={FileMSG.REMOVET} description={FileMSG.REMOVED} onConfirm={confirm} onCancel={cancel} okText={FileMSG.Y} cancelText={FileMSG.N}>
          <div className={styles.filePopconfirmWrapper}>
            <DeleteOutlined />
          </div>
        </Popconfirm>
      }
      previewLink = <a href={preview} className={styles.filePreviewLink} target="_blank" />
    }
  }

  if (itemSize === ItemSize.S) {
    sizeElement = typeElement = null
  }

  return <div style={itemStyle} className={`${styles.file} ${previewClass} ${styles.selectableItem}`} data-item-id={id}>
    {iconUploading} {sizeElement} {typeElement} {errorElement} {iconRemove} {filenameElement} {previewLink}
  </div>
}

export default FileItem