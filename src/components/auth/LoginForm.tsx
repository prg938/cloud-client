
'use client'

import {Dispatch, SetStateAction, useState} from 'react'
import {Button, Form, Input, notification} from 'antd'
import {LockOutlined, UpSquareOutlined} from '@ant-design/icons'
import type {LoginFormDTO} from '@/dto'
import {setCookie} from 'nookies'
import * as API from '@/api'
import {Rules} from './Rules'
import {TOKEN, COOKIE_SETTINGS} from '@/const'
import {useRouter} from 'next/navigation'

enum BUTTON {
  ENTER = 'войти',
  PROCESS = 'выполняется вход...'
}

const login = async (
  data: LoginFormDTO,
  router: ReturnType<typeof useRouter>,
  setButtonDisabled: Dispatch<SetStateAction<boolean>>,
  setButtonText: Dispatch<SetStateAction<string>>,
  ) => {
  setButtonDisabled(true)
  setButtonText(BUTTON.PROCESS)
  try {
    const {token} = await API.Auth.login(data)
    setCookie(undefined, TOKEN, token, COOKIE_SETTINGS)
    notification.success({
      message: 'ок!',
      description: 'переходим в dashboard',
      duration: 2
    })
    router.replace('/dashboard')
  }
  catch(_) {
    setButtonDisabled(false)
    setButtonText(BUTTON.ENTER)
    console.warn(_)
    notification.error({
      message: 'ошибка!',
      description: 'такого пользователя не существует',
      duration: 2
    })
  }
}

const LoginForm: React.FC = () => {
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false)
  const [buttonText, setButtonText] = useState<string>(BUTTON.ENTER)
  const router = useRouter()
  const iconClass = 'site-form-item-icon'

  return <Form name="login" className="login-form" onFinish={data => login(data, router, setButtonDisabled, setButtonText)}>
    <Form.Item
      name="email"
      normalize={Rules.trimmer}
      rules={Rules.email}>
        <Input size='large' prefix={<UpSquareOutlined className={iconClass} />} placeholder="имейл" />
    </Form.Item>
    <Form.Item
      name="password"
      rules={Rules.password}>
        <Input.Password size='large' prefix={<LockOutlined className={iconClass} />} placeholder="пароль" />
    </Form.Item>
    <Form.Item>
      <Button disabled={buttonDisabled} type="dashed" htmlType="submit" className="login-form-button">
        {buttonText}
      </Button>
    </Form.Item>
  </Form>
}

export default LoginForm