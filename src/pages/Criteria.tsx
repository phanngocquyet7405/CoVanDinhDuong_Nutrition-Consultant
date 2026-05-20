import MainLayout from "../layout/MainLayout";
import { useState, useEffect } from "react";
import { Info, Loader2 } from "lucide-react";
import { getCriteria } from "../api/criteria.api";

interface Criterion {
  id: number; // Khớp với `@PrimaryGeneratedColumn()` của TypeORM
  name: string;
  emoji?: string;
  type: "benefit" | "cost"; // Đồng bộ chữ thường với Database Enum
  weight: number;
  description?: string;
  color?: string;
  bg?: string;
}

const defaultColors: Record<
  string,
  { color: string; bg: string; emoji: string }
> = {
  protein: { color: "#3b82f6", bg: "#eff6ff", emoji: "💪" },
  calories: { color: "#f59e0b", bg: "#fef9c3", emoji: "🔥" },
  cost: { color: "#10b981", bg: "#f0fdf4", emoji: "💰" },
  fat: { color: "#ef4444", bg: "#fef2f2", emoji: "🧈" },
};

function getStyle(c: Criterion) {
  // Dùng c.name để map màu mặc định vì c.id bây giờ là số tự tăng từ Backend
  const key = c.name ? String(c.name).toLowerCase() : "";
  return defaultColors[key] ?? { color: "#6366f1", bg: "#f5f3ff", emoji: "📊" };
}

export default function Criteria() {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCriteria()
      .then((res) => setCriteria(res.data))
      .catch(() => setError("Không thể tải tiêu chí. Vui lòng thử lại."))
      .finally(() => setLoading(false));
  }, []);

  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0) || 1;

  return (
    <MainLayout>
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: 700,
            color: "#0f172a",
            margin: "0 0 6px",
            letterSpacing: "-0.4px",
          }}
        >
          Decision Criteria
        </h1>
        <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
          Tiêu chí và trọng số sử dụng trong phương pháp AHP
        </p>
      </div>

      {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "80px 0",
            gap: "12px",
          }}
        >
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <Loader2
            size={20}
            color="#6366f1"
            style={{ animation: "spin 1s linear infinite" }}
          />
          <span style={{ fontSize: "14px", color: "#64748b" }}>
            Đang tải dữ liệu...
          </span>
        </div>
      )}

      {error && !loading && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            padding: "16px 20px",
            color: "#b91c1c",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Criteria Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(criteria.length, 4)}, 1fr)`,
              gap: "14px",
              marginBottom: "28px",
            }}
          >
            {criteria.map((c) => {
              const style = getStyle(c);
              const color = c.color ?? style.color;
              const bg = c.bg ?? style.bg;
              const emoji = c.emoji ?? style.emoji;
              const pct =
                totalWeight > 0
                  ? Math.round((c.weight / totalWeight) * 100)
                  : 0;

              return (
                <div
                  key={c.id}
                  style={{
                    background: "#fff",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    padding: "20px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "11px",
                        background: bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                      }}
                    >
                      {emoji}
                    </div>
                    {/* SỬA ĐỔI: So sánh với chữ thường "benefit" để đồng bộ với Interface/API */}
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "3px 9px",
                        borderRadius: "20px",
                        fontWeight: 500,
                        background:
                          c.type === "benefit" ? "#f0fdf4" : "#fef2f2",
                        color: c.type === "benefit" ? "#16a34a" : "#ef4444",
                        textTransform: "capitalize", // Tự động viết hoa chữ cái đầu (Benefit/Cost) khi hiển thị
                      }}
                    >
                      {c.type}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#1e293b",
                      margin: "0 0 6px",
                    }}
                  >
                    {c.name}
                  </h3>
                  {c.description && (
                    <p
                      style={{
                        fontSize: "11.5px",
                        color: "#94a3b8",
                        margin: "0 0 14px",
                        lineHeight: 1.5,
                      }}
                    >
                      {c.description}
                    </p>
                  )}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                      }}
                    >
                      <span style={{ fontSize: "11px", color: "#64748b" }}>
                        Trọng số
                      </span>
                      <span
                        style={{ fontSize: "12px", fontWeight: 700, color }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: "5px",
                        borderRadius: "99px",
                        background: "#f1f5f9",
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          borderRadius: "99px",
                          background: color,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary bar */}
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              padding: "20px 24px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", gap: "8px", flex: 1 }}>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  height: "10px",
                  borderRadius: "99px",
                  overflow: "hidden",
                  gap: "2px",
                }}
              >
                {criteria.map((c) => {
                  const style = getStyle(c);
                  return (
                    <div
                      key={c.id}
                      style={{
                        flex: c.weight,
                        background: c.color ?? style.color,
                        transition: "flex 0.4s ease",
                      }}
                    />
                  );
                })}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "16px",
                flexShrink: 0,
                flexWrap: "wrap",
              }}
            >
              {criteria.map((c) => {
                const style = getStyle(c);
                return (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: c.color ?? style.color,
                      }}
                    />
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      {c.name} {Math.round((c.weight / totalWeight) * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexShrink: 0,
              }}
            >
              <Info size={14} color="#94a3b8" />
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                Phân bổ trọng số AHP
              </span>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
}
