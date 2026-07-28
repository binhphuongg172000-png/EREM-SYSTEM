export default function AdminDashboardLoading() {
  return (
    <div style={{ animation: "fadeIn 0.2s ease-out" }}>
      {/* Header skeleton */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div style={{ height: 32, width: 280, borderRadius: 10, background: "linear-gradient(90deg,rgba(30,41,59,0.8) 0%,rgba(51,65,85,0.4) 50%,rgba(30,41,59,0.8) 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
        <div style={{ height: 28, width: 160, borderRadius: 8, background: "linear-gradient(90deg,rgba(30,41,59,0.8) 0%,rgba(51,65,85,0.4) 50%,rgba(30,41,59,0.8) 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      </div>

      {/* Stat cards skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ borderRadius: 16, padding: "1.25rem", background: "rgba(15,23,42,0.7)", border: "1px solid rgba(51,65,85,0.5)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ height: 14, width: 100, borderRadius: 6, background: "rgba(51,65,85,0.6)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
              <div style={{ height: 36, width: 36, borderRadius: 10, background: "rgba(51,65,85,0.6)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
            </div>
            <div style={{ height: 32, width: 120, borderRadius: 8, background: "rgba(51,65,85,0.6)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
            <div style={{ height: 10, width: 80, borderRadius: 4, background: "rgba(51,65,85,0.4)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
          </div>
        ))}
      </div>

      {/* Chart area skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        {[...Array(2)].map((_, i) => (
          <div key={i} style={{ borderRadius: 16, padding: "1.25rem", background: "rgba(15,23,42,0.7)", border: "1px solid rgba(51,65,85,0.5)", height: 260 }}>
            <div style={{ height: 18, width: 160, borderRadius: 6, background: "rgba(51,65,85,0.6)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%", marginBottom: "1rem" }} />
            <div style={{ height: 200, borderRadius: 10, background: "rgba(51,65,85,0.3)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div style={{ borderRadius: 16, padding: "1.25rem", background: "rgba(15,23,42,0.7)", border: "1px solid rgba(51,65,85,0.5)" }}>
        <div style={{ height: 18, width: 200, borderRadius: 6, background: "rgba(51,65,85,0.6)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%", marginBottom: "1rem" }} />
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem", alignItems: "center" }}>
            <div style={{ height: 14, flex: 3, borderRadius: 4, background: "rgba(51,65,85,0.4)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
            <div style={{ height: 14, flex: 2, borderRadius: 4, background: "rgba(51,65,85,0.4)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
            <div style={{ height: 14, flex: 1, borderRadius: 4, background: "rgba(51,65,85,0.4)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
