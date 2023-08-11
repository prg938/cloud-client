import {Metadata} from "next"
import {FC} from "react"
import JWT from "@/components/auth/JWT"
import Dashboard from "./Dashboard"

export const metadata: Metadata = {
  title: 'Dashbord',
  description: 'View dashboard',
}

const ProtectedDashboard: FC = () => <JWT required={true} redirect='/dashboard/auth'><Dashboard /></JWT>

export default ProtectedDashboard