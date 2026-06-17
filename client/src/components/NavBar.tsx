import type { MouseEvent } from 'react';
import { resetWorkflow } from '../store/boardSlice';
import { useAppDispatch } from '../store/hooks';

export default function NavBar() {
  const dispatch = useAppDispatch();

  const handleHome = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    dispatch(resetWorkflow());

    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-slate-200/60 bg-[#FAF9F5] px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <a
          href="/"
          onClick={handleHome}
          className="text-xl font-bold tracking-tight text-slate-800 transition-opacity hover:opacity-80"
        >
          moodboard.ai
        </a>
      </div>
    </header>
  );
}
