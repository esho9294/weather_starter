import { Sidebar } from './Sidebar';
import { Hero } from './Hero';
import { ThemeSelector } from './ThemeSelector';

export function Layout() {
  return (
    <div className="flex h-full min-h-screen w-full">
      <Sidebar />
      <div className="relative flex flex-1 flex-col">
        <div className="absolute right-6 top-6 z-10">
          <ThemeSelector />
        </div>
        <Hero />
      </div>
    </div>
  );
}
