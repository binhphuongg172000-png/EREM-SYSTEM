import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "@/app/sale/proposals/[id]/PrintButton";

import { getCachedData } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function SaleHandoverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const cacheKey = `sale_handover_detail_${id}`;
  const handover = await getCachedData(cacheKey, async () => {
    return prisma.handover.findUnique({
      where: { id },
      include: {
        school: true,
        sender: true,
        receiver: true,
        proposal: {
          include: {
            items: true,
            investments: true,
          }
        }
      }
    });
  }, 30);

  if (!handover) {
    notFound();
  }

  return (
    <div>
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
          @page { size: portrait; margin: 15mm 20mm; }
          body { background: white !important; }
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible !important; color: black !important; background: white !important; font-family: "Times New Roman", Times, serif; }
          .print-only { position: absolute; left: 0; top: 0; width: 100%; display: block !important; padding: 0; }
          .screen-only { display: none !important; }
          
          table, th, td { border: 1px solid black !important; border-collapse: collapse; }
        }
      `}</style>

      <div className="screen-only" style={{ marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <Link href="/sale/handovers" style={{ color: "#38bdf8", textDecoration: "none", marginBottom: "0.5rem", display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.85rem", fontWeight: 600 }}>
            &larr; Quay lại danh sách Biên bản
          </Link>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 800, marginTop: "0.25rem", color: "#ffffff" }}>Biên bản Bàn giao Chi tiết</h1>
        </div>
        <div>
          <PrintButton fileName={`BienBanBanGiao_${handover.school?.name || "Truong"}.doc`} />
        </div>
      </div>

      <div className="card screen-only" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", borderBottom: "1px solid #1e293b", paddingBottom: "0.5rem", color: "#ffffff" }}>Thông tin Biên bản</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <p><strong>Đơn vị Nhận bàn giao:</strong> <span style={{ color: "#ffffff" }}>{handover.school?.name}</span></p>
            <p><strong>Địa chỉ:</strong> <span style={{ color: "#cbd5e1" }}>{handover.school?.address}</span></p>
            <p><strong>Đại diện Bên nhận:</strong> <span style={{ color: "#ffffff" }}>{handover.receiver?.name || "Bàn giao theo hợp đồng"}</span></p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <p><strong>Đại diện Bên giao (Sale):</strong> <span style={{ color: "#38bdf8" }}>{handover.sender?.name}</span></p>
            <p><strong>Ngày lập biên bản:</strong> <span style={{ color: "#ffffff" }}>{new Date(handover.createdAt).toLocaleString("vi-VN")}</span></p>
            <p>
              <strong>Trạng thái:</strong> 
              <span className={`badge ${handover.status === "CONFIRMED" ? "badge-success" : "badge-warning"}`} style={{ marginLeft: "0.5rem" }}>
                {handover.status === "CONFIRMED" ? "Đã ký nhận" : "Khởi tạo"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="card table-container screen-only" style={{ padding: 0 }}>
        <div style={{ padding: "1.25rem 1.5rem 0.5rem 1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff" }}>Danh mục Thiết bị & Hạng mục Bàn giao</h2>
        </div>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Tên thiết bị / Hạng mục</th>
              <th>Cấu hình / Ghi chú</th>
              <th style={{ textAlign: "center" }}>Số lượng</th>
              <th style={{ textAlign: "right" }}>Đơn giá (đ)</th>
            </tr>
          </thead>
          <tbody>
            {(!handover.proposal?.items || handover.proposal.items.length === 0) && (!handover.proposal?.investments || handover.proposal.investments.length === 0) ? (
              <tr><td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "#cbd5e1" }}>Chưa có danh mục thiết bị bàn giao</td></tr>
            ) : (
              <>
                {handover.proposal?.items.map((item: any) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700, color: "#ffffff" }}>{item.name}</td>
                    <td style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{item.specifications || "-"}</td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "#ffffff" }}>{Number(item.quantity)}</td>
                    <td style={{ textAlign: "right" }}>{Number(item.price).toLocaleString()}</td>
                  </tr>
                ))}
                {handover.proposal?.investments.map((inv: any) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 700, color: "#ffffff" }}>{inv.name}</td>
                    <td style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{inv.description || "-"}</td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "#ffffff" }}>{Number(inv.quantity)}</td>
                    <td style={{ textAlign: "right" }}>{Number(inv.price).toLocaleString()}</td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* PRINT ONLY SECTION - BIÊN BẢN BÀN GIAO */}
      <div className="print-only" style={{ fontSize: "14px", lineHeight: "1.5" }}>
        <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "15px" }}>
          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br />
          Độc lập - Tự do - Hạnh phúc<br />
          ---oOo---
        </div>
        
        <h2 style={{ textAlign: "center", margin: "20px 0 10px 0", fontSize: "20px", fontWeight: "bold", textTransform: "uppercase" }}>
          BIÊN BẢN BÀN GIAO THIẾT BỊ
        </h2>
        
        <div style={{ fontStyle: "italic", marginBottom: "15px" }}>
          Hôm nay, vào lúc ........ giờ ngày ........ tháng ........ năm 202... tại Văn phòng {handover.school?.name} chúng tôi gồm:
        </div>

        <div style={{ fontWeight: "bold" }}>BÊN A: CÔNG TY CỔ PHẦN GIÁO DỤC ISMART</div>
        <div style={{ marginLeft: "20px", marginBottom: "10px" }}>
          <div>Giấy ĐKKD số: <strong>0311810462</strong> Do: <strong>Sở KH&ĐT TP.HCM</strong> Cấp lần 12 ngày: <strong>05/05/2025</strong></div>
          <div>Địa chỉ: Lầu 3, Tòa Nhà Quỳnh Lan, 60 Hai Bà Trưng, Phường Bến Nghé, Quận 1, TP.HCM.</div>
          <div>Đại diện bởi: .............................................................. Chức vụ: ..................................................</div>
          <div>Sau đây gọi tắt là <strong>"Bên A"</strong> hay <strong>"iSMART Education"</strong>.</div>
        </div>

        <div style={{ fontWeight: "bold", marginBottom: "10px" }}>Và</div>

        <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>BÊN B: {handover.school?.name}</div>
        <div style={{ marginLeft: "20px", marginBottom: "15px" }}>
          <div>Địa chỉ: {handover.school?.address}</div>
          <div>Đại diện bởi: .............................................................. Chức vụ: ..................................................</div>
          <div>Mã số thuế: ..............................................................</div>
          <div>Sau đây gọi tắt là <strong>"Bên B"</strong> hay <strong>"Nhà trường"</strong>.</div>
        </div>

        <div style={{ textIndent: "20px", marginBottom: "15px", textAlign: "justify" }}>
          Căn cứ theo hợp đồng số: ........../HĐHT-ISMART ngày ....../....../...... giữa Công ty Cổ phần Giáo dục ISMART và {handover.school?.name} ("Hợp đồng số ...../......."). Sau khi bàn bạc và thảo luận. Bên A tiến hành bàn giao số lượng tài sản/thiết bị, cũng như cùng nghiệm thu các hạng mục thi công với Bên B như sau:
        </div>

        <div style={{ marginBottom: "10px" }}>
          Số phòng lắp đặt: <strong>{handover.school?.investedClassrooms || "..."}</strong> 
          <span style={{ display: "inline-block", width: "50px" }}></span> 
          Tên phòng: ..............................................................
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px", textAlign: "center" }}>
          <thead>
            <tr style={{ fontWeight: "bold" }}>
              <th style={{ padding: "8px", width: "5%" }}>STT</th>
              <th style={{ padding: "8px", width: "35%" }}>Tên tài sản/thiết bị</th>
              <th style={{ padding: "8px", width: "10%" }}>Số lượng</th>
              <th style={{ padding: "8px", width: "15%" }}>Đơn vị tính</th>
              <th style={{ padding: "8px", width: "20%" }}>Linh kiện kèm theo</th>
              <th style={{ padding: "8px", width: "15%" }}>Tình Trạng</th>
            </tr>
          </thead>
          <tbody>
            {handover.proposal?.items?.map((item: any, idx: number) => (
              <tr key={item.id}>
                <td style={{ padding: "8px" }}>{idx + 1}</td>
                <td style={{ padding: "8px", textAlign: "left" }}>{item.name}</td>
                <td style={{ padding: "8px" }}>{Number(item.quantity)}</td>
                <td style={{ padding: "8px" }}>Cái</td>
                <td style={{ padding: "8px", textAlign: "left", fontSize: "13px" }}>_ {item.specifications || "..."}</td>
                <td style={{ padding: "8px" }}>Mới 100%</td>
              </tr>
            ))}
            {handover.proposal?.investments?.map((inv: any, idx: number) => (
              <tr key={inv.id}>
                <td style={{ padding: "8px" }}>{(handover.proposal?.items?.length || 0) + idx + 1}</td>
                <td style={{ padding: "8px", textAlign: "left" }}>{inv.name}</td>
                <td style={{ padding: "8px" }}>{Number(inv.quantity)}</td>
                <td style={{ padding: "8px" }}>Gói</td>
                <td style={{ padding: "8px", textAlign: "left", fontSize: "13px" }}>_ {inv.description || "..."}</td>
                <td style={{ padding: "8px" }}>Mới 100%</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ textIndent: "20px", marginBottom: "30px", textAlign: "justify" }}>
          Biên bản bàn giao lắp đặt thiết bị được lập thành 02 (hai) bản gốc bằng tiếng Việt và có hiệu lực kể từ ngày ký. Mỗi bên giữ 01 (một) bản và có giá trị pháp lý như nhau.
        </div>

        <table style={{ width: "100%", border: "none !important" }}>
          <tbody>
            <tr>
              <td style={{ border: "none !important", width: "33%", textAlign: "center", fontWeight: "bold" }}>BÊN A<br/><span style={{ fontWeight: "normal" }}>(Ký & đóng dấu)</span></td>
              <td style={{ border: "none !important", width: "33%", textAlign: "center", fontWeight: "bold" }}>Phụ trách trường<br/><span style={{ fontWeight: "normal" }}>(Ký & đóng dấu)</span></td>
              <td style={{ border: "none !important", width: "33%", textAlign: "center", fontWeight: "bold" }}>BÊN B<br/><span style={{ fontWeight: "normal" }}>(Ký & đóng dấu)</span></td>
            </tr>
            <tr>
              <td style={{ height: "100px", border: "none !important" }}></td>
              <td style={{ border: "none !important" }}></td>
              <td style={{ border: "none !important" }}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
