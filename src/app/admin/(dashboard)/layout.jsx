import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminDashboardLayout({ children }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">{children}</main>
    </div>
  );
}
