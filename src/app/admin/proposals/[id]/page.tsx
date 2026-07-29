import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProposalStatusSelect from "../ProposalStatusSelect";
import { cookies } from "next/headers";
import { ArrowLeft, Package, Building2, CheckCircle2, XCircle, FileText, Wrench } from "lucide-react";
import PrintButton from "@/app/sale/proposals/[id]/PrintButton";
import ExportHandoverButton from "@/components/ExportHandoverButton";
import DeleteProposalDetailButton from "./DeleteProposalDetailButton";
import { getCachedData } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const cookieStore = await cookies();
  const userRole = cookieStore.get("userRole")?.value;
  const isSysAdmin = userRole === "SUPER_ADMIN";
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const cacheKey = `admin_proposal_detail_${id}`;
  const { proposal, catalogItems, catalogInvestments } = await getCachedData(cacheKey, async () => {
    const [proposal, catalogItems, catalogInvestments] = await Promise.all([
      prisma.proposal.findUnique({
        where: { id },
        include: {
          school: true,
          items: true,
          investments: true,
          sale: true,
        }
      }),
      prisma.item.findMany({ select: { name: true, unit: true } }),
      prisma.otherInvestment.findMany({ select: { name: true, unit: true, description: true } })
    ]);
    return { proposal, catalogItems, catalogInvestments };
  }, 30);

  if (!proposal) {
    notFound();
  }

  const proposalNewStudents = (proposal as any).newStudents ?? proposal.school?.newStudents ?? 0;
  const proposalOldStudents = (proposal as any).oldStudents ?? proposal.school?.oldStudents ?? 0;
  const proposalInvestedClassrooms = (proposal as any).investedClassrooms ?? proposal.school?.investedClassrooms ?? 0;

  const allocated = (proposal.status !== "CLOSED" && proposalNewStudents > 0)
    ? Math.floor((proposalNewStudents * 100000000) / 105)
    : Number(proposal.allocatedBudget || 0);
  const invested = Number(proposal.investedBudget);
  const delta = allocated - invested;

  let badgeClass = "badge-orange";
  let statusText = "Khởi tạo";
  if (proposal.status === "COMPLETED") { badgeClass = "badge-success"; statusText = "Hoàn thành"; }
  else if (proposal.school?.isLocked || proposal.status === "APPROVED") { badgeClass = "badge-error"; statusText = "Đang thực hiện"; }

  const groupedItems = Array.from(proposal.items.reduce((acc, curr) => {
    if (acc.has(curr.name)) {
      acc.get(curr.name).quantity += Number(curr.quantity);
      acc.get(curr.name).totalPrice += Number(curr.totalPrice);
    } else {
      const unit = catalogItems.find(c => c.name === curr.name)?.unit || "Bộ";
      acc.set(curr.name, { ...curr, quantity: Number(curr.quantity), totalPrice: Number(curr.totalPrice), unit });
    }
    return acc;
  }, new Map<string, any>()).values());

  const groupedInvestments = Array.from(proposal.investments.reduce((acc, curr) => {
    if (acc.has(curr.name)) {
      acc.get(curr.name).quantity += Number(curr.quantity);
      acc.get(curr.name).totalPrice += Number(curr.totalPrice);
    } else {
      const catalogInv = catalogInvestments.find(c => c.name === curr.name);
      const unit = catalogInv?.unit || "Cái";
      const description = curr.description || catalogInv?.description || "";
      const category = (catalogInv as any)?.category || "INVESTMENT";
      acc.set(curr.name, { ...curr, quantity: Number(curr.quantity), totalPrice: Number(curr.totalPrice), unit, description, category });
    }
    return acc;
  }, new Map<string, any>()).values());

  const isConstructionItemName = (inv: any) => {
    if (inv.category === "CONSTRUCTION") return true;
    const lower = (inv.name || "").toLowerCase();
    return lower.startsWith("gói thi công") || lower.startsWith("gói bảo trì") || lower.startsWith("gói hệ thống");
  };

  const groupedConstructions = groupedInvestments.filter(inv => isConstructionItemName(inv));
  const groupedOtherInvestments = groupedInvestments.filter(inv => !isConstructionItemName(inv));

  const totalItemCost = groupedItems.reduce((s: number, i: any) => s + Number(i.totalPrice), 0);
  const totalConstrCost = groupedConstructions.reduce((s: number, i: any) => s + Number(i.totalPrice), 0);
  const totalOtherCost = groupedOtherInvestments.reduce((s: number, i: any) => s + Number(i.totalPrice), 0);

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        
        .print-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 1rem; border-radius: 8px;
          background: rgba(56, 189, 248, 0.1); color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.2);
          cursor: pointer; font-weight: 600; transition: all 0.2s;
        }
        .print-btn:hover { background: rgba(56, 189, 248, 0.2); }
        
        @media screen {
          .print-only { display: none !important; }
        }
        
        @media print {
          @page { size: A4 landscape; margin: 5mm 10mm 4mm 10mm; }
          html, body { background: white !important; }
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible !important; color: black !important; background: white !important; font-family: "Times New Roman", Times, serif; }
          .print-only { position: absolute; left: 0; top: 0; width: 100%; display: block !important; padding: 0; font-size: 11px; line-height: 1.25; }
          .screen-only { display: none !important; }
          
          .print-bg-orange { background-color: #fce4d6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-bg-lightorange { background-color: #fef0e5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          
          table, th, td { border: 1px solid black !important; border-collapse: collapse; }
        }
      `}</style>
      {/* Header */}
      <div className="screen-only" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
        <div>
          <Link href="/admin/proposals" style={{ color: "#64748b", textDecoration: "none", marginBottom: "0.5rem", display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", fontWeight: 500, transition: "color 0.2s" }}>
            &larr; Quay lại danh sách Kho Dự trù
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.35rem" }}>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0, color: "#ffffff", letterSpacing: "-0.02em" }}>Chi tiết Hồ sơ Dự trù</h1>
            <span className={`badge ${badgeClass}`} style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem" }}>
              {statusText}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <div style={{ height: "fit-content" }}><PrintButton fileName={`DuTruKinhPhi_${proposal.school?.name || "Truong"}.doc`} /></div>
          {isSysAdmin && (
            <DeleteProposalDetailButton proposalId={proposal.id} schoolName={proposal.school?.name || "Trường"} />
          )}
        </div>
      </div>

      <div className="screen-only">
        {/* School Info Bar */}
        <div className="card" style={{ marginBottom: "1rem", padding: "1rem 1.5rem", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #38bdf8, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Building2 size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Trường học</div>
              <div style={{ fontSize: "0.95rem", color: "#ffffff", fontWeight: 700 }}>{proposal.school.name}</div>
            </div>
          </div>
          <div style={{ height: "32px", width: "1px", background: "#1e293b" }} />
          <div>
            <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Địa chỉ</div>
            <div style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{proposal.school.address}</div>
          </div>
          <div style={{ height: "32px", width: "1px", background: "#1e293b" }} />
          <div>
            <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Nhân viên Sale</div>
            <div style={{ fontSize: "0.85rem", color: "#38bdf8", fontWeight: 600 }}>{proposal.sale.name}</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
          {/* Ngân sách cấp */}
          <div className="card" style={{ padding: "1rem 1.25rem", borderLeft: "3px solid #38bdf8" }}>
            <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>Ngân sách cấp</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#38bdf8" }}>{allocated.toLocaleString()}<span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#64748b", marginLeft: "4px" }}>VNĐ</span></div>
          </div>
          {/* Tổng đầu tư */}
          <div className="card" style={{ padding: "0.85rem 1.15rem", borderLeft: "3px solid #a78bfa" }}>
            <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.2rem" }}>Tổng Đầu tư</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#a78bfa", marginBottom: "0.35rem" }}>
              {invested.toLocaleString()}<span style={{ fontSize: "0.7rem", fontWeight: 500, color: "#64748b", marginLeft: "3px" }}>VNĐ</span>
            </div>
            <div style={{ fontSize: "0.68rem", display: "flex", flexDirection: "column", gap: "2px", borderTop: "1px solid #1e293b", paddingTop: "0.35rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#38bdf8" }}>• Thiết bị:</span><strong style={{ color: "#f8fafc" }}>{totalItemCost.toLocaleString()} đ</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#06b6d4" }}>• Thi công:</span><strong style={{ color: "#f8fafc" }}>{totalConstrCost.toLocaleString()} đ</strong></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#a78bfa" }}>• Đầu tư khác:</span><strong style={{ color: "#f8fafc" }}>{totalOtherCost.toLocaleString()} đ</strong></div>
            </div>
          </div>
          {/* Chênh lệch */}
          <div className="card" style={{ padding: "1rem 1.25rem", borderLeft: `3px solid ${delta >= 0 ? "#34d399" : "#fb7185"}` }}>
            <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>Chênh lệch</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: delta >= 0 ? "#34d399" : "#fb7185" }}>{delta.toLocaleString()}<span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#64748b", marginLeft: "4px" }}>VNĐ</span></div>
          </div>
          {/* Số học sinh mới */}
          <div className="card" style={{ padding: "1rem 1.25rem", borderLeft: "3px solid #fbbf24" }}>
            <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>Số học sinh mới</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#fbbf24" }}>{proposalNewStudents}</div>
          </div>
          {/* Số học sinh cũ */}
          <div className="card" style={{ padding: "1rem 1.25rem", borderLeft: "3px solid #94a3b8" }}>
            <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>Số học sinh cũ</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#e2e8f0" }}>{proposalOldStudents}</div>
          </div>
          {/* Số phòng học đầu tư */}
          <div className="card" style={{ padding: "1rem 1.25rem", borderLeft: "3px solid #f97316" }}>
            <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>Số phòng học đầu tư</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#fb923c" }}>{proposalInvestedClassrooms}</div>
          </div>
        </div>

        {proposal.status === "REJECTED" && proposal.rejectReason && (
          <div style={{ marginBottom: "1rem", padding: "0.875rem 1.25rem", backgroundColor: "rgba(244, 63, 94, 0.08)", color: "#fb7185", borderRadius: "0.5rem", border: "1px solid rgba(244, 63, 94, 0.2)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <XCircle size={16} style={{ flexShrink: 0 }} />
            <span><strong>Lý do từ chối:</strong> {proposal.rejectReason}</span>
          </div>
        )}

        {/* Items Table */}
        <div className="card table-container" style={{ padding: 0, marginBottom: "1rem" }}>
          <div style={{ padding: "1rem 1.5rem 0.5rem 1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Package size={16} color="#38bdf8" />
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>Danh sách Thiết bị</h2>
            <span style={{ fontSize: "0.75rem", color: "#38bdf8", background: "rgba(56, 189, 248, 0.15)", padding: "0.15rem 0.5rem", borderRadius: "20px", fontWeight: 700 }}>{groupedItems.length}</span>
          </div>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Tên thiết bị</th>
                <th>Cấu hình</th>
                <th style={{ textAlign: "center" }}>Số lượng</th>
                <th style={{ textAlign: "center" }}>Đơn vị tính</th>
                <th style={{ textAlign: "right" }}>Đơn giá (đ)</th>
                <th style={{ textAlign: "right" }}>Thành tiền (đ)</th>
              </tr>
            </thead>
            <tbody>
              {groupedItems.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#cbd5e1" }}>Không có thiết bị</td></tr>
              ) : (
                groupedItems.map((item: any) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700, color: "#ffffff" }}>{item.name}</td>
                    <td style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{item.specifications}</td>
                    <td style={{ textAlign: "center" }}>{Number(item.quantity)}</td>
                    <td style={{ textAlign: "center" }}>{item.unit}</td>
                    <td style={{ textAlign: "right" }}>{Number(item.price).toLocaleString()}</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "#38bdf8" }}>{Number(item.totalPrice).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* HẠNG MỤC ĐẦU TƯ KHÁC */}
        <div className="card table-container" style={{ padding: 0, marginBottom: "1rem" }}>
          <div style={{ padding: "1rem 1.5rem 0.5rem 1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Building2 size={16} color="#a78bfa" />
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>Hạng mục Đầu tư khác</h2>
            <span style={{ fontSize: "0.75rem", color: "#a78bfa", background: "rgba(167, 139, 250, 0.15)", padding: "0.15rem 0.5rem", borderRadius: "20px", fontWeight: 700 }}>{groupedOtherInvestments.length}</span>
          </div>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Tên Hạng mục</th>
                <th>Mô tả</th>
                <th style={{ textAlign: "center" }}>Số lượng</th>
                <th style={{ textAlign: "center" }}>Đơn vị tính</th>
                <th style={{ textAlign: "right" }}>Đơn giá (đ)</th>
                <th style={{ textAlign: "right" }}>Thành tiền (đ)</th>
              </tr>
            </thead>
            <tbody>
              {groupedOtherInvestments.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#cbd5e1" }}>Không có hạng mục đầu tư khác</td></tr>
              ) : (
                groupedOtherInvestments.map((inv: any) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 700, color: "#ffffff" }}>{inv.name}</td>
                    <td style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{inv.description}</td>
                    <td style={{ textAlign: "center" }}>{Number(inv.quantity)}</td>
                    <td style={{ textAlign: "center" }}>{inv.unit}</td>
                    <td style={{ textAlign: "right" }}>{Number(inv.price).toLocaleString()}</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "#a78bfa" }}>{Number(inv.totalPrice).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* HẠNG MỤC THI CÔNG */}
        <div className="card table-container" style={{ padding: 0, marginBottom: "1rem" }}>
          <div style={{ padding: "1rem 1.5rem 0.5rem 1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Wrench size={16} color="#06b6d4" />
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>Hạng mục Thi công</h2>
            <span style={{ fontSize: "0.75rem", color: "#06b6d4", background: "rgba(6, 182, 212, 0.15)", padding: "0.15rem 0.5rem", borderRadius: "20px", fontWeight: 700 }}>{groupedConstructions.length}</span>
          </div>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Tên Hạng mục</th>
                <th>Mô tả</th>
                <th style={{ textAlign: "center" }}>Số lượng</th>
                <th style={{ textAlign: "center" }}>Đơn vị tính</th>
                <th style={{ textAlign: "right" }}>Đơn giá (đ)</th>
                <th style={{ textAlign: "right" }}>Thành tiền (đ)</th>
              </tr>
            </thead>
            <tbody>
              {groupedConstructions.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#cbd5e1" }}>Không có hạng mục thi công</td></tr>
              ) : (
                groupedConstructions.map((inv: any) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 700, color: "#ffffff" }}>{inv.name}</td>
                    <td style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{inv.description}</td>
                    <td style={{ textAlign: "center" }}>{Number(inv.quantity)}</td>
                    <td style={{ textAlign: "center" }}>{inv.unit}</td>
                    <td style={{ textAlign: "right" }}>{Number(inv.price).toLocaleString()}</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "#06b6d4" }}>{Number(inv.totalPrice).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#cbd5e1" }}>Trạng thái hiện tại:</span>
          <div style={{ width: "200px", textAlign: "right" }}>
            <ProposalStatusSelect
              proposal={{
                id: proposal.id,
                status: proposal.status,
                school: {
                  name: proposal.school.name,
                  isLocked: proposal.school.isLocked
                }
              }}
              isSysAdmin={isSysAdmin}
            />
          </div>
        </div>
      </div>

      {/* PRINT ONLY SECTION - OPTIMIZED FOR EXACT 1 PAGE A4 LANDSCAPE */}
      <div className="print-only" style={{ fontSize: "11px", lineHeight: 1.25 }}>
        <div style={{ fontSize: "10px" }}>Công ty cổ phần Giáo dục iSmart</div>
        <div style={{ fontSize: "10px" }}>Lầu 3, Tòa nhà Quỳnh Lan, 60 Hai Bà Trưng, Phường Sài Gòn, TP Hồ Chí Minh, VN</div>

        <h2 style={{ textAlign: "center", margin: "6px 0 10px 0", fontSize: "16px", fontWeight: "bold", textTransform: "uppercase" }}>
          BẢNG DỰ TRÙ KINH PHÍ
        </h2>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "6px" }}>
          <tbody>
            <tr>
              <td style={{ border: "1px solid black", padding: "3px 6px", width: "15%" }}>Trường:</td>
              <td style={{ border: "1px solid black", padding: "3px 6px", width: "35%", fontWeight: "bold" }}>{proposal.school.name}</td>
              <td style={{ border: "1px solid black", padding: "3px 6px", width: "30%" }}>Tổng số học sinh năm học 2026-2027</td>
              <td style={{ border: "1px solid black", padding: "3px 6px", width: "20%", textAlign: "right" }}>{proposal.school.oldStudents + proposal.school.newStudents}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black", padding: "3px 6px" }}>Sales:</td>
              <td style={{ border: "1px solid black", padding: "3px 6px", fontWeight: "bold" }}>{proposal.sale?.name || ""}</td>
              <td style={{ border: "1px solid black", padding: "3px 6px" }}>Số học sinh mới</td>
              <td style={{ border: "1px solid black", padding: "3px 6px", textAlign: "right" }}>{proposal.school.newStudents}</td>
            </tr>
            <tr>
              <td colSpan={2} style={{ border: "1px solid black", padding: "3px 6px", textAlign: "center" }}>Thời gian đầu tư: 2026 - 2027</td>
              <td style={{ border: "1px solid black", padding: "3px 6px" }}>Số học sinh cũ</td>
              <td style={{ border: "1px solid black", padding: "3px 6px", textAlign: "right" }}>{proposal.school.oldStudents}</td>
            </tr>
            <tr>
              <td colSpan={2} style={{ border: "1px solid black", padding: "3px 6px", textAlign: "center" }}></td>
              <td style={{ border: "1px solid black", padding: "3px 6px" }}>Số phòng học đầu tư</td>
              <td style={{ border: "1px solid black", padding: "3px 6px", textAlign: "right" }}>{proposal.school.investedClassrooms}</td>
            </tr>
            <tr>
              <td colSpan={2} style={{ border: "1px solid black", padding: "3px 6px", textAlign: "center" }}>
                Thời gian khấu hao: {proposal.school?.name?.toUpperCase().includes("THCS") || proposal.school?.name?.toLowerCase().includes("trung học cơ sở") ? "4 năm THCS (2030)" : "5 năm tiểu học (2031)"}
              </td>
              <td style={{ border: "1px solid black", padding: "3px 6px", fontWeight: "bold", textAlign: "center", textTransform: "uppercase" }}>TỔNG NGÂN SÁCH TỐI ĐA ĐƯỢC ĐẦU TƯ</td>
              <td style={{ border: "1px solid black", padding: "3px 6px", fontWeight: "bold", textAlign: "right" }}>{allocated.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr className="print-bg-orange">
              <th style={{ border: "1px solid black", padding: "3px 6px", width: "5%", backgroundColor: "#fce4d6" }}>STT</th>
              <th style={{ border: "1px solid black", padding: "3px 6px", width: "35%", backgroundColor: "#fce4d6" }}>Diễn giải các hạng mục</th>
              <th style={{ border: "1px solid black", padding: "3px 6px", width: "10%", backgroundColor: "#fce4d6" }}>Đơn vị tính</th>
              <th style={{ border: "1px solid black", padding: "3px 6px", width: "15%", backgroundColor: "#fce4d6" }}>Đơn giá</th>
              <th style={{ border: "1px solid black", padding: "3px 6px", width: "10%", backgroundColor: "#fce4d6" }}>Số lượng</th>
              <th style={{ border: "1px solid black", padding: "3px 6px", width: "15%", backgroundColor: "#fce4d6" }}>Thành tiền</th>
              <th style={{ border: "1px solid black", padding: "3px 6px", width: "10%", backgroundColor: "#fce4d6" }}>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            <tr className="print-bg-lightorange">
              <td style={{ border: "1px solid black", padding: "3px 6px", textAlign: "center", fontWeight: "bold", backgroundColor: "#fef0e5" }}>A</td>
              <td style={{ border: "1px solid black", padding: "3px 6px", fontWeight: "bold", backgroundColor: "#fef0e5" }}>NGÂN SÁCH ĐẦU TƯ THIẾT BỊ THỰC HIỆN</td>
              <td style={{ border: "1px solid black", padding: "3px 6px", backgroundColor: "#fef0e5" }}></td>
              <td style={{ border: "1px solid black", padding: "3px 6px", backgroundColor: "#fef0e5" }}></td>
              <td style={{ border: "1px solid black", padding: "3px 6px", backgroundColor: "#fef0e5" }}></td>
              <td style={{ border: "1px solid black", padding: "3px 6px", fontWeight: "bold", textAlign: "right", backgroundColor: "#fef0e5" }}>{totalItemCost.toLocaleString()}</td>
              <td style={{ border: "1px solid black", padding: "3px 6px", backgroundColor: "#fef0e5" }}></td>
            </tr>
            {groupedItems.map((item, idx) => (
              <tr key={item.id || idx}>
                <td style={{ border: "1px solid black", padding: "3px 6px", textAlign: "center" }}>{idx + 1}</td>
                <td style={{ border: "1px solid black", padding: "3px 6px" }}>{item.name}</td>
                <td style={{ border: "1px solid black", padding: "3px 6px", textAlign: "center" }}>{item.unit || "Bộ"}</td>
                <td style={{ border: "1px solid black", padding: "3px 6px", textAlign: "right" }}>{Number(item.price).toLocaleString()}</td>
                <td style={{ border: "1px solid black", padding: "3px 6px", textAlign: "center" }}>{Number(item.quantity)}</td>
                <td style={{ border: "1px solid black", padding: "3px 6px", textAlign: "right" }}>{Number(item.totalPrice).toLocaleString()}</td>
                <td style={{ border: "1px solid black", padding: "3px 6px" }}></td>
              </tr>
            ))}

            <tr className="print-bg-lightorange">
              <td style={{ border: "1px solid black", padding: "3px 6px", textAlign: "center", fontWeight: "bold", backgroundColor: "#fef0e5" }}>B</td>
              <td style={{ border: "1px solid black", padding: "3px 6px", fontWeight: "bold", backgroundColor: "#fef0e5" }}>ĐẦU TƯ KHÁC</td>
              <td style={{ border: "1px solid black", padding: "3px 6px", backgroundColor: "#fef0e5" }}></td>
              <td style={{ border: "1px solid black", padding: "3px 6px", backgroundColor: "#fef0e5" }}></td>
              <td style={{ border: "1px solid black", padding: "3px 6px", backgroundColor: "#fef0e5" }}></td>
              <td style={{ border: "1px solid black", padding: "3px 6px", fontWeight: "bold", textAlign: "right", backgroundColor: "#fef0e5" }}>{totalOtherCost.toLocaleString()}</td>
              <td style={{ border: "1px solid black", padding: "3px 6px", backgroundColor: "#fef0e5" }}></td>
            </tr>
            {groupedOtherInvestments.map((inv, idx) => (
              <tr key={inv.id || idx}>
                <td style={{ border: "1px solid black", padding: "3px 6px", textAlign: "center" }}>{idx + 1}</td>
                <td style={{ border: "1px solid black", padding: "3px 6px" }}>{inv.name}</td>
                <td style={{ border: "1px solid black", padding: "3px 6px", textAlign: "center" }}>{inv.unit || "Cái"}</td>
                <td style={{ border: "1px solid black", padding: "3px 6px", textAlign: "right" }}>{Number(inv.price).toLocaleString()}</td>
                <td style={{ border: "1px solid black", padding: "3px 6px", textAlign: "center" }}>{Number(inv.quantity)}</td>
                <td style={{ border: "1px solid black", padding: "3px 6px", textAlign: "right" }}>{Number(inv.totalPrice).toLocaleString()}</td>
                <td style={{ border: "1px solid black", padding: "3px 6px" }}></td>
              </tr>
            ))}

            <tr className="print-bg-lightorange">
              <td style={{ border: "1px solid black", padding: "3px 6px", textAlign: "center", fontWeight: "bold", backgroundColor: "#fef0e5" }}>C</td>
              <td style={{ border: "1px solid black", padding: "3px 6px", fontWeight: "bold", backgroundColor: "#fef0e5" }}>THI CÔNG</td>
              <td style={{ border: "1px solid black", padding: "3px 6px", backgroundColor: "#fef0e5" }}></td>
              <td style={{ border: "1px solid black", padding: "3px 6px", backgroundColor: "#fef0e5" }}></td>
              <td style={{ border: "1px solid black", padding: "3px 6px", backgroundColor: "#fef0e5" }}></td>
              <td style={{ border: "1px solid black", padding: "3px 6px", fontWeight: "bold", textAlign: "right", backgroundColor: "#fef0e5" }}>{totalConstrCost.toLocaleString()}</td>
              <td style={{ border: "1px solid black", padding: "3px 6px", backgroundColor: "#fef0e5" }}></td>
            </tr>
            {groupedConstructions.map((inv, idx) => (
              <tr key={inv.id || idx}>
                <td style={{ border: "1px solid black", padding: "3px 6px", textAlign: "center" }}>{idx + 1}</td>
                <td style={{ border: "1px solid black", padding: "3px 6px" }}>{inv.name}</td>
                <td style={{ border: "1px solid black", padding: "3px 6px", textAlign: "center" }}>{inv.unit || "Gói"}</td>
                <td style={{ border: "1px solid black", padding: "3px 6px", textAlign: "right" }}>{Number(inv.price).toLocaleString()}</td>
                <td style={{ border: "1px solid black", padding: "3px 6px", textAlign: "center" }}>{Number(inv.quantity)}</td>
                <td style={{ border: "1px solid black", padding: "3px 6px", textAlign: "right" }}>{Number(inv.totalPrice).toLocaleString()}</td>
                <td style={{ border: "1px solid black", padding: "3px 6px" }}></td>
              </tr>
            ))}

            <tr className="print-bg-orange">
              <td colSpan={5} style={{ border: "1px solid black", padding: "3px 6px", textAlign: "center", fontWeight: "bold", backgroundColor: "#fce4d6" }}>TỔNG CỘNG</td>
              <td style={{ border: "1px solid black", padding: "3px 6px", fontWeight: "bold", textAlign: "right", backgroundColor: "#fce4d6" }}>{invested.toLocaleString()}</td>
              <td style={{ border: "1px solid black", padding: "3px 6px", backgroundColor: "#fce4d6" }}></td>
            </tr>
            <tr className="print-bg-orange">
              <td colSpan={5} style={{ border: "1px solid black", padding: "3px 6px", textAlign: "center", fontWeight: "bold", backgroundColor: "#fce4d6" }}>CHÊNH LỆCH NGÂN SÁCH</td>
              <td style={{ border: "1px solid black", padding: "3px 6px", fontWeight: "bold", textAlign: "right", backgroundColor: "#fce4d6" }}>{delta.toLocaleString()}</td>
              <td style={{ border: "1px solid black", padding: "3px 6px", backgroundColor: "#fce4d6" }}></td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: "6px", textAlign: "right", fontStyle: "italic", paddingRight: "30px", pageBreakInside: "avoid" }}>
          TP.HCM, ngày ..... tháng ..... năm 2026
        </div>

        <table style={{ width: "100%", marginTop: "6px", borderCollapse: "collapse", border: "none", pageBreakInside: "avoid" }}>
          <tbody>
            <tr>
              <td style={{ width: "20%", textAlign: "center", fontWeight: "bold", border: "none" }}>Đại diện Sale</td>
              <td style={{ width: "20%", textAlign: "center", fontWeight: "bold", border: "none" }}>Phụ trách khối iSMART</td>
              <td style={{ width: "20%", textAlign: "center", fontWeight: "bold", border: "none" }}>Đại diện IT</td>
              <td style={{ width: "20%", textAlign: "center", fontWeight: "bold", border: "none" }}>Đại diện Tài chính</td>
              <td style={{ width: "20%", textAlign: "center", fontWeight: "bold", border: "none" }}>Giám Đốc</td>
            </tr>
            <tr>
              <td style={{ height: "40px", border: "none" }}></td>
              <td style={{ border: "none" }}></td>
              <td style={{ border: "none" }}></td>
              <td style={{ border: "none" }}></td>
              <td style={{ border: "none" }}></td>
            </tr>
            <tr>
              <td style={{ width: "20%", textAlign: "center", border: "none" }}>{proposal.sale?.name || "................"}</td>
              <td style={{ width: "20%", textAlign: "center", border: "none" }}>Nguyễn Thị Kim Oanh</td>
              <td style={{ width: "20%", textAlign: "center", border: "none" }}>Trần Minh Hoàng</td>
              <td style={{ width: "20%", textAlign: "center", border: "none" }}>Ngô Minh Hòa</td>
              <td style={{ width: "20%", textAlign: "center", border: "none" }}>Nguyễn Thị Quang Ngọc</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
