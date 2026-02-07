import { Outlet } from 'react-router-dom';

export function MobileLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
