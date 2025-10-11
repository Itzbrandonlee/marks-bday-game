export default function Home() {
  const eventId = 'mark-2025'; // ← set your event id
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="text-center p-8">
        <h1 className="text-4xl font-black">🎂 Happy Birthday, Mark!</h1>
        <p className="opacity-80 mt-2">Let’s play a round of Quip-Off.</p>
        <a
          href={`/play/${eventId}`}
          className="inline-block mt-6 px-6 py-3 rounded-xl bg-emerald-500 text-black font-semibold hover:opacity-90"
        >
          Start & Show QR
        </a>
      </div>
    </main>
  );
}