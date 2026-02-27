import React, { useState, useEffect, useRef } from 'react';
import { PORTFOLIO_API_URL } from '../../config';
import './SkillDNA.css';

const SkillDNA = () => {
    const token = localStorage.getItem('token');
    const canvasRef = useRef(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchDNA(); }, []);
    useEffect(() => { if (data) drawRadar(); }, [data]);

    const fetchDNA = async () => {
        try {
            const res = await fetch(`${PORTFOLIO_API_URL}/api/skill-dna/me`, { headers: { Authorization: `Bearer ${token}` } });
            const d = await res.json();
            setData(d.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const drawRadar = () => {
        const canvas = canvasRef.current;
        if (!canvas || !data) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.35;
        ctx.clearRect(0, 0, W, H);

        const dims = Object.keys(data.dimensions);
        const N = dims.length;
        const angleStep = (2 * Math.PI) / N;

        // Draw grid rings
        for (let ring = 1; ring <= 5; ring++) {
            ctx.beginPath();
            for (let i = 0; i <= N; i++) {
                const angle = i * angleStep - Math.PI / 2;
                const r = (ring / 5) * R;
                const x = cx + r * Math.cos(angle), y = cy + r * Math.sin(angle);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.strokeStyle = 'rgba(148,163,184,0.15)';
            ctx.stroke();
        }

        // Draw axes + labels
        dims.forEach((dim, i) => {
            const angle = i * angleStep - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
            ctx.strokeStyle = 'rgba(148,163,184,0.2)';
            ctx.stroke();
            // Label
            const lx = cx + (R + 30) * Math.cos(angle), ly = cy + (R + 30) * Math.sin(angle);
            ctx.fillStyle = '#a5b4fc';
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(dim, lx, ly + 4);
        });

        // Draw data polygon — platform avg (dashed)
        drawPolygon(ctx, cx, cy, R, dims, data.platformAvg, 'rgba(148,163,184,0.3)', 'rgba(148,163,184,0.05)', true);
        // Draw data polygon — user (solid)
        drawPolygon(ctx, cx, cy, R, dims, data.dimensions, 'rgba(99,102,241,0.8)', 'rgba(99,102,241,0.15)', false);
    };

    const drawPolygon = (ctx, cx, cy, R, dims, values, strokeColor, fillColor, dashed) => {
        const N = dims.length;
        const angleStep = (2 * Math.PI) / N;
        ctx.beginPath();
        if (dashed) ctx.setLineDash([5, 5]);
        else ctx.setLineDash([]);
        dims.forEach((dim, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const val = Math.min(100, values[dim] || 0);
            const r = (val / 100) * R;
            const x = cx + r * Math.cos(angle), y = cy + r * Math.sin(angle);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = fillColor; ctx.fill();
        ctx.strokeStyle = strokeColor; ctx.lineWidth = 2; ctx.stroke();
        ctx.setLineDash([]);
    };

    if (loading) return <div className="dna-page"><div className="dna-loading"><div className="loading-spinner"></div></div></div>;

    return (
        <div className="dna-page">
            <div className="dna-hero">
                <h1>🎯 Skill DNA — Bản đồ Năng lực</h1>
                <p>Biểu đồ radar 6 chiều thể hiện năng lực đa lĩnh vực của bạn</p>
            </div>

            <div className="dna-content">
                <div className="dna-chart-container">
                    <canvas ref={canvasRef} width={500} height={500} className="dna-canvas" />
                    <div className="dna-legend">
                        <span className="legend-item"><span className="legend-dot user"></span> Bạn</span>
                        <span className="legend-item"><span className="legend-dot avg"></span> Trung bình platform</span>
                    </div>
                </div>

                <div className="dna-details">
                    <h3>📊 Chi tiết năng lực</h3>
                    {data && Object.entries(data.dimensions).map(([dim, score]) => (
                        <div key={dim} className="dna-bar-item">
                            <div className="dna-bar-label">
                                <span>{dim}</span>
                                <span className="dna-score">{score}/100</span>
                            </div>
                            <div className="dna-bar-bg">
                                <div className="dna-bar-fill" style={{ width: `${score}%` }}>
                                    {data.platformAvg && <div className="dna-bar-avg" style={{ left: `${data.platformAvg[dim] || 0}%` }} title="Trung bình" />}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="dna-stats">
                        <div className="stat-card"><span className="stat-icon">🎯</span><span className="stat-value">{data?.totalSkills || 0}</span><span className="stat-label">Kỹ năng</span></div>
                        <div className="stat-card"><span className="stat-icon">📈</span><span className="stat-value">{data?.growth?.length || 0}</span><span className="stat-label">Ngày hoạt động</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkillDNA;
