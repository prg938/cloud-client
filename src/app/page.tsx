
'use client'

import styles from '@/styles/Index.module.scss'
import {CloudFilled} from '@ant-design/icons'
import {Button} from 'antd'
import {FC} from 'react'

const Index: FC = () => <main className={styles.main}>
  <div>
    <CloudFilled className={styles.cloudIcon} />
  </div>
  <h1>Cloudify <sup><small style={{fontSize: '11px'}}>beta</small></sup></h1>
  <h5>Store your file/s in cloud!</h5>
  <div className={styles.actions}>
    <a href="/dashboard/auth">
      <Button type="dashed" size="large">Login/Register</Button>
    </a>
  </div>
</main>

export default Index