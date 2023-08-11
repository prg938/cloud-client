'use client'

import LoginForm from "./LoginForm"
import RegisterForm from "./RegisterForm"
import {Tabs} from 'antd'

const AuthTabs: React.FC = () => {
  return <Tabs items={[
    {label: 'ВХОД', key: '1', children: <LoginForm />},
    {label: 'РЕГИСТРАЦИЯ', key: '2', children: <RegisterForm />}
  ]} />
}
export default AuthTabs