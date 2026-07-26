import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Get SALE users
  const saleUsers = await prisma.user.findMany({ where: { role: 'SALE', status: 'ACTIVE' } });
  if (saleUsers.length === 0) {
    console.error('Không tìm thấy SALE user nào!');
    process.exit(1);
  }

  // =============================================
  // 1. SCHOOLS - 40 trường (không có số HS/phòng)
  // =============================================
  const schools = [
    // Hà Nội
    { name: 'Trường THCS Nguyễn Du', address: 'Quận Hoàn Kiếm, Hà Nội', principalName: 'Trần Thị Lan', contractNumber: 'HĐ-2024-001' },
    { name: 'Trường Tiểu học Kim Đồng', address: 'Quận Đống Đa, Hà Nội', principalName: 'Vũ Thị Bình', contractNumber: 'HĐ-2024-002' },
    { name: 'Trường THPT Chu Văn An', address: 'Quận Tây Hồ, Hà Nội', principalName: 'Lê Minh Tuấn', contractNumber: 'HĐ-2024-003' },
    { name: 'Trường Tiểu học Lê Văn Thiêm', address: 'Quận Cầu Giấy, Hà Nội', principalName: 'Nguyễn Thị Mai', contractNumber: 'HĐ-2024-004' },
    { name: 'Trường THCS Ngô Sỹ Liên', address: 'Quận Hoàng Mai, Hà Nội', principalName: 'Phạm Văn Đức', contractNumber: 'HĐ-2024-005' },
    { name: 'Trường THPT Yên Hòa', address: 'Quận Cầu Giấy, Hà Nội', principalName: 'Trịnh Văn Hải', contractNumber: 'HĐ-2024-006' },
    { name: 'Trường Tiểu học Đoàn Thị Điểm', address: 'Quận Nam Từ Liêm, Hà Nội', principalName: 'Lê Thị Thu Hà', contractNumber: 'HĐ-2024-007' },
    { name: 'Trường Mầm non Hoa Hồng', address: 'Quận Long Biên, Hà Nội', principalName: 'Ngô Thị Phương', contractNumber: 'HĐ-2024-008' },
    { name: 'Trường THCS Trung Hòa', address: 'Quận Cầu Giấy, Hà Nội', principalName: 'Bùi Văn Thắng', contractNumber: 'HĐ-2024-009' },
    { name: 'Trường Tiểu học Thành Công B', address: 'Quận Ba Đình, Hà Nội', principalName: 'Hoàng Thị Lan', contractNumber: 'HĐ-2024-010' },
    // TP.HCM
    { name: 'Trường Tiểu học Lê Văn Tám', address: 'Quận 1, TP. Hồ Chí Minh', principalName: 'Nguyễn Văn Hùng', contractNumber: 'HĐ-2024-011' },
    { name: 'Trường THPT Lê Hồng Phong', address: 'Quận 5, TP. Hồ Chí Minh', principalName: 'Đặng Văn Thành', contractNumber: 'HĐ-2024-012' },
    { name: 'Trường THCS Nguyễn Văn Tố', address: 'Quận 10, TP. Hồ Chí Minh', principalName: 'Lý Thị Kim Oanh', contractNumber: 'HĐ-2024-013' },
    { name: 'Trường Mầm non Hoa Mai', address: 'Quận Bình Thạnh, TP. Hồ Chí Minh', principalName: 'Phạm Thị Hoa', contractNumber: 'HĐ-2024-014' },
    { name: 'Trường Tiểu học Nguyễn Bỉnh Khiêm', address: 'Quận 1, TP. Hồ Chí Minh', principalName: 'Trịnh Thị Loan', contractNumber: 'HĐ-2024-015' },
    { name: 'Trường THCS Hồng Bàng', address: 'Quận 5, TP. Hồ Chí Minh', principalName: 'Đinh Văn Lộc', contractNumber: 'HĐ-2024-016' },
    { name: 'Trường THPT Marie Curie', address: 'Quận 3, TP. Hồ Chí Minh', principalName: 'Huỳnh Thị Thanh', contractNumber: 'HĐ-2024-017' },
    { name: 'Trường Tiểu học Đinh Tiên Hoàng', address: 'Quận Bình Thạnh, TP. Hồ Chí Minh', principalName: 'Vương Văn Minh', contractNumber: 'HĐ-2024-018' },
    { name: 'Trường Mầm non Tuổi Thơ', address: 'Quận Tân Bình, TP. Hồ Chí Minh', principalName: 'Trần Thị Nga', contractNumber: 'HĐ-2024-019' },
    { name: 'Trường THCS Lương Thế Vinh', address: 'Quận 7, TP. Hồ Chí Minh', principalName: 'Đỗ Văn Bình', contractNumber: 'HĐ-2024-020' },
    // Đà Nẵng
    { name: 'Trường THCS Trần Phú', address: 'Quận Hải Châu, TP. Đà Nẵng', principalName: 'Hoàng Văn Nam', contractNumber: 'HĐ-2024-021' },
    { name: 'Trường THPT Phan Châu Trinh', address: 'Quận Hải Châu, TP. Đà Nẵng', principalName: 'Lê Ngọc Sơn', contractNumber: 'HĐ-2024-022' },
    { name: 'Trường Tiểu học Trần Quốc Toản', address: 'Quận Thanh Khê, TP. Đà Nẵng', principalName: 'Nguyễn Thị Cúc', contractNumber: 'HĐ-2024-023' },
    { name: 'Trường Mầm non Sao Mai', address: 'Quận Ngũ Hành Sơn, TP. Đà Nẵng', principalName: 'Phan Thị Lệ', contractNumber: 'HĐ-2024-024' },
    { name: 'Trường THCS Huỳnh Bá Chánh', address: 'Huyện Hòa Vang, TP. Đà Nẵng', principalName: 'Võ Văn Tài', contractNumber: 'HĐ-2024-025' },
    // Hải Phòng
    { name: 'Trường Mầm non Sơn Ca', address: 'Quận Lê Chân, TP. Hải Phòng', principalName: 'Ngô Thị Thu', contractNumber: 'HĐ-2024-026' },
    { name: 'Trường Tiểu học Trần Phú', address: 'Quận Ngô Quyền, TP. Hải Phòng', principalName: 'Tạ Văn Long', contractNumber: 'HĐ-2024-027' },
    { name: 'Trường THCS Lê Quý Đôn', address: 'Quận Hồng Bàng, TP. Hải Phòng', principalName: 'Chu Thị Hạnh', contractNumber: 'HĐ-2024-028' },
    { name: 'Trường THPT Thái Phiên', address: 'Quận Ngô Quyền, TP. Hải Phòng', principalName: 'Trương Văn Khoa', contractNumber: 'HĐ-2024-029' },
    { name: 'Trường Tiểu học Lạch Tray', address: 'Quận Ngô Quyền, TP. Hải Phòng', principalName: 'Đinh Thị Xuân', contractNumber: 'HĐ-2024-030' },
    // Cần Thơ
    { name: 'Trường THCS Lý Thường Kiệt', address: 'Quận Ninh Kiều, TP. Cần Thơ', principalName: 'Bùi Văn Hải', contractNumber: 'HĐ-2024-031' },
    { name: 'Trường THPT Châu Văn Liêm', address: 'Quận Ninh Kiều, TP. Cần Thơ', principalName: 'Lưu Thị Kiều', contractNumber: 'HĐ-2024-032' },
    { name: 'Trường Tiểu học Lý Tự Trọng', address: 'Quận Bình Thủy, TP. Cần Thơ', principalName: 'Hứa Văn Phú', contractNumber: 'HĐ-2024-033' },
    { name: 'Trường Mầm non Hoa Cúc', address: 'Quận Ô Môn, TP. Cần Thơ', principalName: 'Trần Thị Yến', contractNumber: 'HĐ-2024-034' },
    { name: 'Trường THCS Châu Văn Liêm', address: 'Huyện Phong Điền, TP. Cần Thơ', principalName: 'Mai Văn Thọ', contractNumber: 'HĐ-2024-035' },
    // Khác
    { name: 'Trường THPT Quốc Học Huế', address: 'TP. Huế, Thừa Thiên Huế', principalName: 'Dương Văn Khánh', contractNumber: 'HĐ-2024-036' },
    { name: 'Trường Tiểu học Trưng Vương', address: 'TP. Vinh, Nghệ An', principalName: 'Hoàng Thị Tuyết', contractNumber: 'HĐ-2024-037' },
    { name: 'Trường THCS Nguyễn Trãi', address: 'TP. Quy Nhơn, Bình Định', principalName: 'Lê Văn Phúc', contractNumber: 'HĐ-2024-038' },
    { name: 'Trường THPT Nguyễn Huệ', address: 'TP. Pleiku, Gia Lai', principalName: 'Nay Thị Hoa', contractNumber: 'HĐ-2024-039' },
    { name: 'Trường Mầm non Hướng Dương', address: 'TP. Buôn Ma Thuột, Đắk Lắk', principalName: 'H\'Len Buôn Krông', contractNumber: 'HĐ-2024-040' },
  ];

  for (let i = 0; i < schools.length; i++) {
    const saleUser = saleUsers[i % saleUsers.length];
    await prisma.school.create({
      data: {
        name: schools[i].name,
        address: schools[i].address,
        principalName: schools[i].principalName,
        contractNumber: schools[i].contractNumber,
        oldStudents: 0,
        newStudents: 0,
        investedClassrooms: 0,
        saleId: saleUser.id,
      }
    });
    console.log(`✓ Trường [${i+1}/40]: ${schools[i].name} → ${saleUser.name}`);
  }

  // =============================================
  // 2. ITEMS - 10 thiết bị
  // =============================================
  const items = [
    { code: 'TB-001', name: 'Máy tính bảng BBBG Smart Edu Pro 10.5"', specifications: 'Màn hình IPS 10.5", CPU Octa-core 2.0GHz, RAM 4GB, ROM 64GB, Android 13, Pin 7000mAh, Hỗ trợ LTE', accessories: 'Bút cảm ứng, Bao da bảo vệ, Cáp sạc Type-C, Củ sạc 18W', unit: 'Bộ', standardPrice: 4500000 },
    { code: 'TB-002', name: 'Máy tính bảng BBBG Kids Tab 8"', specifications: 'Màn hình IPS 8", CPU Quad-core 1.8GHz, RAM 3GB, ROM 32GB, Android 12, Pin 5000mAh, Chống va đập, Chống nước IPX4', accessories: 'Ốp lưng chống sốc, Cáp sạc Micro-USB, Củ sạc', unit: 'Bộ', standardPrice: 3200000 },
    { code: 'TB-003', name: 'Tủ sạc thông minh 20 ngăn', specifications: 'Chứa 20 thiết bị, Tổng công suất 500W, Cổng sạc USB-C và USB-A, Hệ thống làm mát, Khóa điện tử 4 số, Báo động chống trộm', accessories: 'Dây khóa bảo mật x20, Sổ giao nhận', unit: 'Bộ', standardPrice: 18000000 },
    { code: 'TB-004', name: 'Màn hình tương tác thông minh 75 inch', specifications: 'Màn hình LED 75", Độ phân giải 4K UHD (3840x2160), Cảm ứng 20 điểm đồng thời, OS Android 11, RAM 4GB, ROM 32GB, Loa tích hợp 2x20W, Độ sáng 450 nit', accessories: 'Giá đỡ di động có khóa, Bút cảm ứng x2, Cáp HDMI 3m, Điều khiển từ xa', unit: 'Bộ', standardPrice: 45000000 },
    { code: 'TB-005', name: 'Màn hình tương tác thông minh 86 inch', specifications: 'Màn hình LED 86", Độ phân giải 4K UHD, Cảm ứng 20 điểm, OS Android 11, RAM 8GB, ROM 64GB, Loa 2x30W, Độ sáng 500 nit, Chống chói OGS', accessories: 'Giá treo tường, Bút cảm ứng x4, Cáp HDMI 5m, Hộp OPS tích hợp', unit: 'Bộ', standardPrice: 65000000 },
    { code: 'TB-006', name: 'Bộ phần mềm LMS BBBG - Bản quyền năm', specifications: 'Bản quyền 1 năm/trường, Không giới hạn số học sinh và giáo viên, Quản lý bài giảng, Kiểm tra trực tuyến, Báo cáo tiến độ học tập, Hỗ trợ đa nền tảng (Web, iOS, Android)', accessories: null, unit: 'Bản quyền', standardPrice: 6000000 },
    { code: 'TB-007', name: 'Router Wifi 6 Giáo dục AX3000', specifications: 'Chuẩn Wifi 6 (802.11ax), Băng thông tổng 3000Mbps, Hỗ trợ 100+ thiết bị đồng thời, 4 anten ngoài 5dBi, Cổng LAN Gigabit x4, Cổng WAN x1', accessories: 'Dây nguồn, Cáp LAN 2m, Hướng dẫn cài đặt', unit: 'Cái', standardPrice: 2800000 },
    { code: 'TB-008', name: 'Bộ loa không dây cho lớp học', specifications: 'Công suất 30W, Kết nối Bluetooth 5.0 và 3.5mm AUX, Pin 8000mAh (12 giờ), Micro không dây đi kèm, Phạm vi kết nối 20m', accessories: 'Micro không dây x1, Cáp sạc, Túi đựng', unit: 'Bộ', standardPrice: 3500000 },
    { code: 'TB-009', name: 'Camera giám sát lớp học AI 4MP', specifications: 'Độ phân giải 4MP (2560x1440), Thấu kính 2.8mm, Góc nhìn 110°, Hỗ trợ AI nhận diện khuôn mặt, Hồng ngoại ban đêm 30m, Kết nối PoE và Wifi', accessories: 'Vít gắn tường, Cáp PoE 10m, Hướng dẫn cài đặt', unit: 'Cái', standardPrice: 1800000 },
    { code: 'TB-010', name: 'Máy chiếu thông minh 4K Android', specifications: 'Độ phân giải 4K (3840x2160), Độ sáng 3500 ANSI Lumens, Tỉ lệ tương phản 10000:1, OS Android 10, RAM 2GB, ROM 16GB, Kết nối HDMI/USB/Wifi/Bluetooth, Tuổi thọ bóng đèn 30,000h', accessories: 'Điều khiển từ xa, Cáp HDMI 2m, Túi đựng', unit: 'Cái', standardPrice: 12000000 },
  ];

  for (const item of items) {
    await prisma.item.create({ data: item });
    console.log(`✓ Thiết bị: ${item.name}`);
  }

  // =============================================
  // 3. OTHER INVESTMENTS - 20 đầu tư khác
  // =============================================
  const otherInvestments = [
    { name: 'Lắp đặt hệ thống wifi toàn trường', description: 'Thi công hệ thống mạng không dây toàn trường bao gồm: khảo sát, thiết kế, lắp đặt các access point, cấu hình và kiểm tra vận hành. Đảm bảo phủ sóng 100% diện tích trường.', unit: 'Trọn gói', standardPrice: 15000000 },
    { name: 'Đào tạo giáo viên sử dụng thiết bị', description: 'Tổ chức các buổi đào tạo thực hành cho toàn bộ giáo viên về cách sử dụng thiết bị BBBG, phần mềm LMS và các ứng dụng giảng dạy. Bao gồm tài liệu hướng dẫn in ấn.', unit: 'Trọn gói', standardPrice: 5000000 },
    { name: 'Bảo hành mở rộng thiết bị năm 2', description: 'Dịch vụ bảo hành mở rộng toàn bộ thiết bị trong năm thứ 2 kể từ ngày bàn giao. Bao gồm sửa chữa và thay thế linh kiện, không bao gồm màn hình vỡ do va đập.', unit: 'Năm', standardPrice: 2000000 },
    { name: 'Bảo hành mở rộng thiết bị năm 3', description: 'Dịch vụ bảo hành mở rộng toàn bộ thiết bị trong năm thứ 3 kể từ ngày bàn giao.', unit: 'Năm', standardPrice: 2500000 },
    { name: 'Vận chuyển và lắp đặt thiết bị', description: 'Chi phí vận chuyển thiết bị từ kho đến trường, bốc xếp cẩn thận, lắp đặt và cố định tại vị trí theo yêu cầu, cấu hình ban đầu và kiểm tra vận hành toàn bộ.', unit: 'Trọn gói', standardPrice: 3000000 },
    { name: 'Tư vấn và thiết kế phòng học BBBG', description: 'Dịch vụ khảo sát thực tế, tư vấn bố trí không gian và thiết kế sơ đồ phòng học tối ưu theo quy trình dạy và học của chương trình BBBG.', unit: 'Trọn gói', standardPrice: 2500000 },
    { name: 'Lắp đặt tủ sạc thiết bị', description: 'Dịch vụ lắp đặt, cố định tủ sạc tại vị trí đã định, kéo đường điện chuyên dụng, kiểm tra an toàn điện và bàn giao vận hành.', unit: 'Tủ', standardPrice: 1500000 },
    { name: 'Phần mềm quản lý tủ sạc thông minh', description: 'Bản quyền phần mềm quản lý tập trung toàn bộ tủ sạc: theo dõi trạng thái sạc, lịch sử sử dụng, báo cáo pin theo từng thiết bị.', unit: 'Bản quyền', standardPrice: 4000000 },
    { name: 'Cài đặt và cấu hình thiết bị đầu cuối', description: 'Dịch vụ cài đặt ứng dụng học tập, cấu hình chính sách MDM (Mobile Device Management), thiết lập tài khoản cho từng học sinh và đồng bộ với hệ thống LMS.', unit: 'Thiết bị', standardPrice: 50000 },
    { name: 'Hỗ trợ kỹ thuật từ xa 1 năm', description: 'Dịch vụ hỗ trợ kỹ thuật từ xa qua điện thoại và phần mềm điều khiển từ xa trong vòng 1 năm. Thời gian phản hồi trong vòng 2 giờ làm việc.', unit: 'Năm', standardPrice: 8000000 },
    { name: 'Lắp đặt màn hình tương tác', description: 'Dịch vụ lắp đặt màn hình lên giá đỡ hoặc treo tường, kéo đường điện và HDMI, kết nối với máy tính giáo viên, cấu hình và kiểm tra vận hành.', unit: 'Màn hình', standardPrice: 2000000 },
    { name: 'Kiểm định thiết bị định kỳ 6 tháng', description: 'Dịch vụ kiểm định toàn bộ thiết bị 2 lần/năm: kiểm tra phần cứng, vệ sinh bụi, cập nhật phần mềm, kiểm tra pin và báo cáo tình trạng thiết bị.', unit: 'Lần', standardPrice: 3500000 },
    { name: 'Đào tạo admin hệ thống LMS', description: 'Đào tạo chuyên sâu cho 1-2 cán bộ phụ trách IT của trường về quản trị hệ thống LMS: thêm/xóa người dùng, quản lý nội dung, xuất báo cáo, xử lý sự cố cơ bản.', unit: 'Trọn gói', standardPrice: 3000000 },
    { name: 'Cung cấp và lắp đặt kệ đựng thiết bị', description: 'Cung cấp kệ inox chất lượng cao để đựng và bảo quản máy tính bảng khi không sử dụng, có khóa bảo mật, thoáng khí chống ẩm.', unit: 'Kệ', standardPrice: 2200000 },
    { name: 'Dịch vụ phục hồi dữ liệu', description: 'Dịch vụ sao lưu và phục hồi dữ liệu học sinh trên hệ thống LMS trong trường hợp sự cố. Bao gồm thiết lập backup tự động hàng ngày lên cloud.', unit: 'Năm', standardPrice: 5000000 },
    { name: 'Gói nội dung học tập số BBBG', description: 'Bộ nội dung học tập kỹ thuật số theo chương trình GDPT 2018 gồm: bài giảng video, bài tập tương tác, đề kiểm tra, tài liệu tham khảo theo từng khối lớp.', unit: 'Bộ/Năm', standardPrice: 7000000 },
    { name: 'Lắp đặt hệ thống điện ổn định UPS', description: 'Thi công lắp đặt thiết bị lưu điện (UPS) để bảo vệ thiết bị khỏi mất điện đột ngột và điện áp không ổn định. Công suất phù hợp cho từng phòng học.', unit: 'Phòng', standardPrice: 6500000 },
    { name: 'Thi công sơn phòng học chuyên biệt', description: 'Sơn tường phòng học với màu sắc chuyên biệt phù hợp với tiêu chuẩn phòng học BBBG: tường xanh nhạt, bảng từ trắng tích hợp, chống chói và dễ vệ sinh.', unit: 'Phòng', standardPrice: 12000000 },
    { name: 'Mua sắm bàn ghế học sinh BBBG', description: 'Bàn ghế học sinh theo tiêu chuẩn BBBG: Bàn có ngăn kéo đựng thiết bị, mặt bàn phẳng mịn dễ vệ sinh, ghế có đệm êm, khung inox chắc chắn.', unit: 'Bộ/Bàn+Ghế', standardPrice: 1800000 },
    { name: 'Lắp đặt hệ thống điều hòa phòng học', description: 'Lắp đặt điều hòa nhiệt độ 2 chiều inverter cho phòng học BBBG, đảm bảo nhiệt độ ổn định để bảo vệ tuổi thọ thiết bị. Bao gồm thi công đường ống và điện chuyên dụng.', unit: 'Phòng', standardPrice: 18000000 },
  ];

  for (const inv of otherInvestments) {
    await prisma.otherInvestment.create({ data: inv });
    console.log(`✓ Đầu tư khác: ${inv.name}`);
  }

  console.log('\n✅ Seed hoàn tất!');
  console.log('   - 40 trường học');
  console.log('   - 10 thiết bị');
  console.log('   - 20 đầu tư khác');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
