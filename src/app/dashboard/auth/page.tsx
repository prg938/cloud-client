
import {Metadata} from "next"
import styles from '@/styles/Dashboard.module.scss'
import AuthTabs from '@/components/auth/AuthTabs'
import JWT from "@/components/auth/JWT"
import {FC} from "react"

export const metadata: Metadata = {
  title: 'Dashboard Auth',
  description: 'Dashboard Auth',
}

const Auth: FC = () => <main className={styles.auth}><AuthTabs /></main>

const ProtectedAuth: FC = () => <JWT required={false} redirect="/dashboard"><Auth /></JWT>

export default ProtectedAuth