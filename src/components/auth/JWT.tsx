import {FC, PropsWithChildren} from "react"
import {cookies} from 'next/headers'
import {TOKEN} from '@/const'
import {verify} from 'jsonwebtoken'
import {redirect} from "next/navigation"

const containsJWT = () => {
  const nextCookies = cookies()
  const token = nextCookies.get(TOKEN)
  if (!token) {
    return false
  }
  try {
    const {value} = token
    const secret = process.env.SECRET_KEY || ''
    const decoded = verify(value, secret)
    return true
  }
  catch(_) {
    return false
  }
}

interface JWTProps {
  redirect: string
  required: boolean
}

const JWT: FC<PropsWithChildren<JWTProps>> = ({children, required, redirect: to}) => {
  const hasJWT = containsJWT()
  if (required) {
    if (hasJWT) return children
    redirect(to)
  }
  if (!required) {
    if (!hasJWT) return children
    redirect(to)
  }
}
export default JWT