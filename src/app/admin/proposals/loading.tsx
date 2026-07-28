export default function AdminProposalsLoading() {
  return (
    <div style={{ animation: "fadeIn 0.2s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div style={{ height: 28, width: 200, borderRadius: 8, background: "rgba(51,65,85,0.5)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
        <div style={{ height: 36, width: 140, borderRadius: 10, background: "rgba(51,65,85,0.5)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
      </div>
      <div style={{ borderRadius: 16, padding: "1.25rem", background: "rgba(15,23,42,0.7)", border: "1px solid rgba(51,65,85,0.5)" }}>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 36, flex: 1, borderRadius: 8, background: "rgba(51,65,85,0.5)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
          ))}
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem", padding: "0.75rem", borderRadius: 10, background: "rgba(51,65,85,0.15)" }}>
            {[3, 2, 1, 1, 1].map((flex, j) => (
              <div key={j} style={{ height: 16, flex, borderRadius: 4, background: "rgba(51,65,85,0.4)", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }} />
            ))}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
