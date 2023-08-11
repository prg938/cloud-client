
'use client'

import { Auth } from "@/api"
import { Button } from "antd"
import { useRouter } from "next/navigation"
import { FC } from "react"

const clickEvent = (router: ReturnType<typeof useRouter>) => {
  Auth.logout()
  router.replace('/')
}

const Dashboard: FC = () => {
  const router = useRouter()
  return <>
    <div>dashboard</div>
    <div>
      <Button onClick={() => clickEvent(router)} type="default" htmlType="submit">выйти из профиля</Button>
    </div>
  </>
}

export default Dashboard