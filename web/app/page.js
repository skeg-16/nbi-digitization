import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-[var(--panel-bg)] shadow-lg border border-[var(--border-color)] rounded-xl p-10 space-y-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--nbi-blue)" }}>NBI Digitization Tool</h1>
        <p className="text-[var(--text-muted)] text-lg">Streamline official records by easily capturing and managing complaints.</p>
        
        <div className="grid gap-4 mt-6">
          <Link href="/capture" className="btn-formal btn-primary w-full py-4 justify-center text-base">
            Capture New Document (Mobile)
          </Link>
          <Link href="/records" className="btn-formal w-full py-4 justify-center text-base" style={{ border: "2px solid var(--nbi-blue)", color: "var(--nbi-blue)" }}>
            View Records Dashboard (Desktop)
          </Link>
        </div>
      </div>
    </div>
  );
}
