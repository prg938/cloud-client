import { Metadata } from "next"
import JWT from "@/components/auth/JWT"
import Component from "./Bin"

export const metadata: Metadata = {
  title: 'bin',
  description: 'View bin',
}

const Page: React.FC = () => <JWT required={true} redirect='/dashboard/auth'><Component /></JWT>

export default Page