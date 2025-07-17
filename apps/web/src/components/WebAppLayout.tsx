import { AppHeader } from './AppHeader';

interface WebAppLayoutProps {
  children: React.ReactNode;
}

export function WebAppLayout({ children }: WebAppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <main>{children}</main>
    </div>
  );
}