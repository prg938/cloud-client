import {Metadata} from "next"
import {FC} from "react"
import JWT from "@/components/auth/JWT"
import Component from "./Dashboard"

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'View dashboard',
}

const Page: FC = () => <JWT required={true} redirect='/dashboard/auth'><Component /></JWT>

export default Page