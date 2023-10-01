import {create} from 'zustand'

interface SiderStore {
  collapsed: boolean
  setCollapsed: (value: boolean) => void
}
export const useSiderStore = create<SiderStore>()(set => ({
  collapsed: false,
  setCollapsed: value => set(state => ({collapsed: value}))
}))