import MainLayout from "../layout/MainLayout";
import { useState, useEffect } from "react";
import { Sparkles, ChevronRight, Loader2 } from "lucide-react";
import { runDSS } from "../api/recommend.api";
import { getCriteria } from "../api/criteria.api";

interface Criterion {
    id: string | number; // Cập nhật lại kiểu dữ liệu có thể chứa cả số từ API
    name: string;
    emoji?: string;
    color?: string;
}

interface DSSResult {
    rank: number;
    name: string;
    score: number;
    calories?: number;
    protein?: number;
    cost?: number;
    fat?: number;
}

const defaultColors: Record<string, { color: string; emoji: string; desc: string }> = {
    protein: { color: "#3b82f6", emoji: "💪", desc: "Ưu tiên hàm lượng protein cao" },
    calories: { color: "#f59e0b", emoji: "🔥", desc: "Ưu tiên kiểm soát năng lượng" },
    cost: { color: "#10b981", emoji: "💰", desc: "Ưu tiên giá thành hợp lý" },
    fat: { color: "#ef4444", emoji: "🧈", desc: "Ưu tiên ít chất béo" },
};

function getCriterionStyle(c: Criterion) {
    // ĐÃ SỬA: Ép kiểu c.id thành String một cách tường minh phòng trường hợp API trả về dạng Number
    const idKey = c.id != null ? String(c.id).toLowerCase() : "";
    return defaultColors[idKey] ?? { color: "#6366f1", emoji: "📊", desc: "Tiêu chí" };
}

export default function Recommend() {
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [weights, setWeights] = useState<Record<string | number, number>>({});
    const [results, setResults] = useState<DSSResult[] | null>(null);
    const [running, setRunning] = useState(false);
    const [loadingCriteria, setLoadingCriteria] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getCriteria()
            .then(res => {
                const data: Criterion[] = res.data;
                setCriteria(data);
                const initial: Record<string | number, number> = {};
                data.forEach(c => { initial[c.id] = 5; });
                setWeights(initial);
            })
            .catch(() => setError("Không thể tải tiêu chí."))
            .finally(() => setLoadingCriteria(false));
    }, []);

    const total = Object.values(weights).reduce((s, v) => s + v, 0) || 1;

    const handleRun = () => {
        setRunning(true);
        setError(null);
        const weightArray = criteria.map(c => weights[c.id] ?? 5);
        runDSS(weightArray)
            .then(res => setResults(res.data))
            .catch(() => setError("Lỗi khi chạy DSS. Vui lòng thử lại."))
            .finally(() => setRunning(false));
    };

    return (
        <MainLayout>
            <div style={{ marginBottom: "28px" }}>
                <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.4px" }}>
                    Nutrition Recommendation
                </h1>
                <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                    Điều chỉnh mức độ quan trọng của từng tiêu chí để nhận gợi ý tối ưu
                </p>
            </div>

            {error && (
                <div style={{
                    background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px",
                    padding: "14px 18px", color: "#b91c1c", fontSize: "13.5px",
                    marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px",
                }}>
                    ⚠️ {error}
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "20px", alignItems: "start" }}>
                {/* Left: Weight sliders */}
                <div style={{
                    background: "#fff", borderRadius: "16px",
                    border: "1px solid #e2e8f0", padding: "24px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}>
                    <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a", margin: "0 0 20px" }}>
                        Cài đặt trọng số
                    </h2>

                    {loadingCriteria ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0", gap: "10px" }}>
                            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                            <Loader2 size={18} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
                            <span style={{ fontSize: "13px", color: "#64748b" }}>Đang tải tiêu chí...</span>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {criteria.map(c => {
                                const style = getCriterionStyle(c);
                                const color = c.color ?? style.color;
                                const val = weights[c.id] ?? 5;
                                const pct = Math.round((val / total) * 100);
                                return (
                                    <div key={c.id}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <span style={{ fontSize: "18px" }}>{c.emoji ?? style.emoji}</span>
                                                <div>
                                                    <p style={{ fontSize: "13.5px", fontWeight: 600, color: "#1e293b", margin: 0 }}>
                                                        {c.name}
                                                    </p>
                                                    <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>
                                                        {style.desc}
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <span style={{ fontSize: "16px", fontWeight: 700, color }}>{val}</span>
                                                <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>≈{pct}%</span>
                                            </div>
                                        </div>
                                        <input
                                            type="range" min="1" max="9" step="1"
                                            value={val}
                                            onChange={e => setWeights(w => ({ ...w, [c.id]: +e.target.value }))}
                                            style={{ width: "100%", accentColor: color, cursor: "pointer" }}
                                        />
                                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
                                            {[1, 3, 5, 7, 9].map(n => (
                                                <span key={n} style={{ fontSize: "10px", color: "#cbd5e1" }}>{n}</span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Distribution bar */}
                    {!loadingCriteria && criteria.length > 0 && (
                        <div style={{
                            marginTop: "20px", padding: "14px 16px",
                            background: "#f8fafc", borderRadius: "10px", border: "1px solid #f1f5f9",
                        }}>
                            <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 8px", fontWeight: 500 }}>
                                Phân bổ trọng số
                            </p>
                            <div style={{ display: "flex", height: "8px", borderRadius: "99px", overflow: "hidden", gap: "2px" }}>
                                {criteria.map(c => {
                                    const style = getCriterionStyle(c);
                                    const val = weights[c.id] ?? 5;
                                    return (
                                        <div key={c.id} style={{
                                            flex: val,
                                            background: c.color ?? style.color,
                                            transition: "flex 0.3s ease",
                                        }} />
                                    );
                                })}
                            </div>
                            <div style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
                                {criteria.map(c => {
                                    const style = getCriterionStyle(c);
                                    const val = weights[c.id] ?? 5;
                                    const pct = Math.round((val / total) * 100);
                                    return (
                                        <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: c.color ?? style.color }} />
                                            <span style={{ fontSize: "11px", color: "#64748b" }}>{c.name} {pct}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleRun}
                        disabled={running || loadingCriteria}
                        style={{
                            marginTop: "20px", width: "100%",
                            padding: "12px 20px", borderRadius: "12px",
                            background: (running || loadingCriteria) ? "#e2e8f0" : "linear-gradient(135deg, #3b82f6, #6366f1)",
                            color: (running || loadingCriteria) ? "#94a3b8" : "#fff",
                            border: "none", cursor: (running || loadingCriteria) ? "not-allowed" : "pointer",
                            fontSize: "14px", fontWeight: 600,
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                            boxShadow: (running || loadingCriteria) ? "none" : "0 4px 14px rgba(99,102,241,0.35)",
                            transition: "all 0.2s",
                        }}
                    >
                        {running ? (
                            <>
                                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                                Đang tính toán...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} />
                                Chạy AHP + TOPSIS
                            </>
                        )}
                    </button>
                </div>

                {/* Right: Results */}
                <div style={{
                    background: "#fff", borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    overflow: "hidden",
                }}>
                    <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9" }}>
                        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a", margin: 0 }}>
                            Kết quả gợi ý
                        </h2>
                        {results && (
                            <p style={{ fontSize: "12px", color: "#94a3b8", margin: "2px 0 0" }}>
                                {results.length} món được xếp hạng theo điểm TOPSIS
                            </p>
                        )}
                    </div>

                    {!results && !running && (
                        <div style={{ padding: "60px 24px", textAlign: "center" }}>
                            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🧮</div>
                            <p style={{ fontSize: "14px", fontWeight: 500, color: "#64748b", margin: "0 0 6px" }}>
                                Chưa có kết quả
                            </p>
                            <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
                                Điều chỉnh trọng số và nhấn "Chạy AHP + TOPSIS"
                            </p>
                        </div>
                    )}

                    {running && (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 0", gap: "12px" }}>
                            <Loader2 size={20} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
                            <span style={{ fontSize: "14px", color: "#64748b" }}>Đang chạy thuật toán...</span>
                        </div>
                    )}

                    {results && !running && (
                        <div>
                            {results.map((item, i) => {
                                const scoreCol = item.score > 0.8 ? "#10b981" : item.score > 0.7 ? "#3b82f6" : "#f59e0b";
                                const rankEmoji = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                                return (
                                    <div key={item.rank} style={{
                                        padding: "16px 24px",
                                        borderBottom: i < results.length - 1 ? "1px solid #f8fafc" : "none",
                                        display: "flex", alignItems: "center", gap: "14px",
                                    }}>
                                        <div style={{
                                            width: "32px", height: "32px", borderRadius: "10px",
                                            flexShrink: 0, display: "flex", alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: rankEmoji ? "18px" : "14px",
                                            fontWeight: 700,
                                            background: i === 0 ? "#fef9c3" : i === 1 ? "#f1f5f9" : i === 2 ? "#fef2f2" : "#f8fafc",
                                            color: "#475569",
                                        }}>
                                            {rankEmoji ?? item.rank}
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: "13.5px", fontWeight: 600, color: "#1e293b", margin: "0 0 4px" }}>
                                                {item.name}
                                            </p>
                                            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                                {item.calories !== undefined && (
                                                    <span style={{ fontSize: "11px", color: "#f59e0b" }}>🔥 {item.calories} kcal</span>
                                                )}
                                                {item.protein !== undefined && (
                                                    <span style={{ fontSize: "11px", color: "#3b82f6" }}>💪 {item.protein}g</span>
                                                )}
                                                {item.cost !== undefined && (
                                                    // ĐÃ SỬA: Kiểm tra an toàn trước khi format tiền tệ trong danh sách kết quả
                                                    <span style={{ fontSize: "11px", color: "#10b981" }}>💰 {item.cost != null ? `${item.cost.toLocaleString("vi-VN")}đ` : "—"}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                                            <p style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px", color: scoreCol }}>
                                                {item.score.toFixed(3)}
                                            </p>
                                            <div style={{ width: "60px", height: "4px", borderRadius: "99px", background: "#f1f5f9" }}>
                                                <div style={{
                                                    width: `${item.score * 100}%`, height: "100%",
                                                    borderRadius: "99px", background: scoreCol,
                                                }} />
                                            </div>
                                        </div>
                                        <ChevronRight size={14} color="#cbd5e1" />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}