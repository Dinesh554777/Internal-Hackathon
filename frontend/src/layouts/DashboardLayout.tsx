import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 bg-zinc-50 p-6 dark:bg-zinc-900">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
