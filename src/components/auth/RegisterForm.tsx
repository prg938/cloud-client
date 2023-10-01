'use client'
import {Dispatch, SetStateAction, useState} from 'react'
import {Button, Form, Input, notification} from 'antd'
import {LockOutlined, UserOutlined, UpSquareOutlined} from '@ant-design/icons'
import type {RegisterFormDTO} from '@/dto'
import {Rules} from './Rules'
import {setCookie} from 'nookies'
import * as API from '@/api'
import {TOKEN, COOKIE_SETTINGS} from '@/const'
import {useRouter} from 'next/navigation'

enum BUTTON {
  REG = 'зарегистрировать',
  PROCESS = 'выполняется регистрация...'
}

const register = async (
  data: RegisterFormDTO,
  router: ReturnType<typeof useRouter>,
  setButtonDisabled: Dispatch<SetStateAction<boolean>>,
  setButtonText: Dispatch<SetStateAction<string>>
  ) => {
  setButtonDisabled(true)
  setButtonText(BUTTON.PROCESS)
  try {
    const {token} = await API.Auth.register(data)
    setCookie(undefined, TOKEN, token, COOKIE_SETTINGS)
    notification.success({
      message: 'ок!',
      description: 'переходим в dashboard',
      duration: 2
    })
    router.replace('/dashboard')
  }
  catch(_: any) {
    setButtonDisabled(false)
    setButtonText(BUTTON.REG)
    console.warn(_)
    notification.error({
      message: 'ошибка!',
      description: _?.message || String(_),
      duration: 2
    })
  }
}

const RegisterForm: React.FC = () => {
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false)
  const [buttonText, setButtonText] = useState<string>(BUTTON.REG)
  const router = useRouter()
  const iconClass = 'site-form-item-icon'

  return <Form name="register" className="login-form" onFinish={data => register(data, router, setButtonDisabled, setButtonText)}>
    <Form.Item
      name="fullname"
      normalize={Rules.trimmer}
      rules={Rules.fullname}>
        <Input prefix={<UserOutlined className={iconClass} />} placeholder="имя" />
    </Form.Item>
    <Form.Item
      name="email"
      normalize={Rules.trimmer}
      rules={Rules.email}>
        <Input prefix={<UpSquareOutlined className={iconClass} />} placeholder="имейл" />
    </Form.Item>
    <Form.Item
      name="password"
      rules={Rules.password}>
        <Input.Password prefix={<LockOutlined className={iconClass} />} placeholder="пароль" />
    </Form.Item>
    <Form.Item>
      <Button disabled={buttonDisabled} type="dashed" htmlType="submit" className="login-form-button">
        {buttonText}
      </Button>
    </Form.Item>
  </Form>
}

export default RegisterForm