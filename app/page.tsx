export default function Home() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1>🚚 Kellywiz Courier</h1>
      <p>Welcome to my first Next.js website.</p>
      <p>This site is being built with Next.js, GitHub, Supabase, and Vercel.</p>

      <button
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Track a Package
      </button>
    </main>
  );
}