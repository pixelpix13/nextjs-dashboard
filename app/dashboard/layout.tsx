import SideNav from '@/app/ui/dashboard/sidenav';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'E-Commerce Dashboard',
};

 
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 flex-none bg-white shadow-lg">
        <SideNav />
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}