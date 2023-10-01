
'use client'

import React from 'react'
import styles from '@/styles/Dashboard.module.scss'
import { PropsWithChildren } from "react"
import { useRouter, usePathname } from 'next/navigation'
import { Auth } from '@/api'
import { HomeOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons'
import { Button, Layout, Menu, Popover, MenuProps, Badge, Breadcrumb, Avatar, message } from 'antd'
import { useFileListData, useUserData } from '@/hooks'
import { FileType } from '@/enums'
import { useSiderStore } from '@/state/sider'

type MenuItem = Required<MenuProps>['items'][number]

const {Header, Content, Footer, Sider} = Layout

const handleLogout = (router: ReturnType<typeof useRouter>) => {
  Auth.logout()
  router.replace('/')
}

const AvatarComponent: React.FC = () => {
  const {data, error, isLoading} = useUserData()
  const Ava = (text: string) => <Avatar size='large' style={{cursor: 'pointer', userSelect: 'none'}}>{text}</Avatar>
  if (isLoading || error) return Ava('')
  const fullname = data!.fullname
  const username = fullname.length > 7 ? fullname[0].toUpperCase() : fullname
  return Ava(username)
}

interface DashboardLayoutProps {}
const DashboardLayout: React.FC<PropsWithChildren<DashboardLayoutProps>> = ({children}) => {
  const {collapsed, setCollapsed} = useSiderStore()
  const {data: files, error, isLoading} = useFileListData(FileType.TRASH)
  const router = useRouter()
  const pathname = usePathname()
  const logout = () => handleLogout(router)
  const isBinPage = pathname.includes('/bin')
  
  let breadcrumbsItems = [{key: 1, title: 'Dashboard'}]
  let binCountElement = <Badge count={(files || []).length} />

  if (isBinPage) {
    breadcrumbsItems.push({key: 2, title: 'корзина'})
  }
  if (isLoading) {
    binCountElement = <LoadingOutlined />
  }

  if (error) message.error('Не удалось загрузить удаленные файлы')

  const items: MenuItem[] = [
    {icon: <HomeOutlined style={{fontSize: 20}}/>, label: 'Главная', key: '/dashboard', onClick: () => router.replace('/dashboard')},
    {icon: <DeleteOutlined style={{fontSize: 20}} />, label: <>Корзина {binCountElement}</>, key: '/dashboard/bin', onClick: () => router.replace('/dashboard/bin')}
  ]

  return (
    <Layout hasSider={true} className={styles.dashboardLayout}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} className={styles.dashboardSider} theme="light">
        <Menu selectedKeys={[pathname]} items={items} className={styles.dashboardMenu} mode="inline" />
      </Sider>
      <Layout>
        <Header className={styles.dashboardHeader}>
          <Popover content={<Button onClick={logout} danger type="primary">выйти из dashboard</Button>} trigger="click">
            <div className={styles.dashboardAvatarWrapper}>
              <AvatarComponent />
            </div>
          </Popover>
        </Header>
        <Content className={styles.dashboardContent}>
          <Breadcrumb className={styles.dashboardBreadcrumb} items={breadcrumbsItems} />
          <div className={styles.mainContentWrapper}>{children}</div>
        </Content>
        <Footer className={styles.dashboardFooter}>Cloudify ©2023</Footer>
      </Layout>
    </Layout>
  )
}
export default DashboardLayout