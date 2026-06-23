import Sidebar from './Sidebar';
import Head from 'next/head';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title = 'CRM' }: AdminLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Head>
        <title>{title} — Glanz & Groom CRM</title>
        <link rel="icon" href="/logo.png" />
      </Head>
      <Sidebar />
      <main className="flex-1 md:ml-64 flex flex-col h-full bg-background overflow-auto">
        {children}
      </main>
    </div>
  );
}
