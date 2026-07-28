export default function SaleDashboardLoading() {
  return (
    <div style={{ animation: "fadeIn 0.2s ease-out" }}>
      {/* Header */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "center", marginBottom: "1.25rem" }}>
        <div style={{ height: 52, borderRadius: 14, background: "linear-gradient(90deg,rgba(30,41,59,0.8) 0%,rgba(51,65,85,0.4) 50%,rgba(30,41,59,0.8) 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
        <div style={{ height: 52, width: 200, borderRadius: 14, background: "linear-gradient(90deg,rgba(30,41,59,0.8) 0%,rgba(51,65,85,0.4) 50%,rgba(30,41,59,0.8) 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      </div>

      {/* Metric cards */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ height: 14, width: 120, borderRadius: 4, background: "rgba(51,65,85,0.5)", marginBottom: "0.85rem", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem" }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ borderRadius: 16, padding: "1.25rem", background: "rgba(15,23,42,0.7)", border: "1px solid rgba(51,65,85,0.5)", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ height: 12, width: 70, borderRadius: 4, background: "rgba(51,65,85,0.6)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
                <div style={{ height: 30, width: 30, borderRadius: 8, background: "rgba(51,65,85,0.6)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
              </div>
              <div style={{ height: 28, width: 50, borderRadius: 6, background: "rgba(51,65,85,0.6)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
            </div>
          ))}
        </div>
      </div>

      {/* Charts area */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
        {[...Array(2)].map((_, i) => (
          <div key={i} style={{ borderRadius: 16, padding: "1.25rem", background: "rgba(15,23,42,0.7)", border: "1px solid rgba(51,65,85,0.5)", height: 240 }}>
            <div style={{ height: 16, width: 150, borderRadius: 6, background: "rgba(51,65,85,0.6)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%", marginBottom: "1rem" }} />
            <div style={{ height: 180, borderRadius: 10, background: "rgba(51,65,85,0.25)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
          </div>
        ))}
      </div>

      {/* Budget cards */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ height: 14, width: 140, borderRadius: 4, background: "rgba(51,65,85,0.5)", marginBottom: "0.85rem", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ borderRadius: 16, padding: "1.25rem", background: "rgba(15,23,42,0.7)", border: "1px solid rgba(51,65,85,0.5)", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ height: 12, width: 100, borderRadius: 4, background: "rgba(51,65,85,0.6)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
                <div style={{ height: 30, width: 30, borderRadius: 8, background: "rgba(51,65,85,0.6)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
              </div>
              <div style={{ height: 28, width: 140, borderRadius: 6, background: "rgba(51,65,85,0.6)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
            </div>
          ))}
        </div>
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
