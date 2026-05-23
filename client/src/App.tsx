import BoardDashboard from './components/board/BoardDashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.08),_transparent_50%)]" />
      <main className="relative">
        <BoardDashboard />
      </main>
    </div>
  );
}
