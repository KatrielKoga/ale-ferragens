import { ClientNavbar } from '@/components/Navbar';

export default function CustomerFacingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientNavbar>{children}</ClientNavbar>;
}
