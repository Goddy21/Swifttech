import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import ScrollProgress from './ScrollProgress';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />
      <Navbar />
      <main className="pt-[66px]">
        <Outlet />
      </main>
    </div>
  );
}