import { AdminNavbar } from '@/components/Navbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminNavbar>{children}</AdminNavbar>;
}
