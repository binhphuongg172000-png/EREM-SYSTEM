# SPECIFICATION & REQUIREMENTS: EREM SYSTEM
*Lưu ý: File này chứa toàn bộ Yêu cầu Nghiệp vụ (BRS) làm nền tảng cho dự án. Mọi thay đổi/bổ sung yêu cầu trong tương lai đều phải được cập nhật và lưu vết tại file này.*

---

## 1. TÍNH NĂNG NỀN TẢNG (GENERAL FEATURES)

### 1.1. Khả năng tương thích đa thiết bị (Mobile-Responsive)
- **Mô tả nghiệp vụ:** Hệ thống được thiết kế linh hoạt để có thể truy cập và sử dụng mượt mà trên mọi nền tảng (Smartphone, Tablet, PC).
- **Ràng buộc logic:** Bắt buộc tối ưu hóa giao diện cho mọi kích thước màn hình, đảm bảo tất cả chức năng (nhập liệu, tra cứu, xuất file PDF/Word) hoạt động ổn định khi Sale thao tác ngoài thị trường.
- **Giao diện hiển thị (UI):** Tự động co giãn màn hình, chuyển đổi menu dọc sang menu gập (Hamburger menu) trên thiết bị di động, hỗ trợ bảng dữ liệu cuộn ngang mượt mà.

### 1.2. Lưu vết hệ thống (Audit Log)
- **Mô tả nghiệp vụ:** Ghi nhận toàn bộ lịch sử thao tác của tất cả các tài khoản truy cập vào hệ thống.
- **Ràng buộc logic:** 
  - Ứng dụng bắt buộc chạy ngầm 100%, tuyệt đối không cho phép bất kỳ người dùng nào (kể cả Admin) tắt, chỉnh sửa hoặc xóa lịch sử. 
  - Thông tin ghi nhận bắt buộc bao gồm: Người thực hiện, thời gian chính xác, hành động chi tiết và dữ liệu trước/sau khi thay đổi (Ví dụ: Admin A đổi giá thiết bị X từ 20M xuống 18M lúc 10:00 21/07/2026; Sale B xóa dự trù Y).
- **Giao diện hiển thị (UI):** Chạy ngầm hoàn toàn trên giao diện người dùng thường, chỉ kết xuất dữ liệu dưới dạng bảng log khi có yêu cầu truy xuất từ Ban quản trị.

---

## 2. PHÂN HỆ ĐĂNG NHẬP & PHÂN QUYỀN

### 2.1. Đăng nhập & Điều hướng tập trung
- **Mô tả nghiệp vụ:** Cổng xác thực tài khoản duy nhất để truy cập vào hệ thống web.
- **Ràng buộc logic:** Sau khi xác thực đúng tên đăng nhập và mật khẩu, hệ thống tự động nhận diện vai trò tài khoản (Sale hoặc Admin) và phân luồng điều hướng:
  - **Tài khoản Sale:** Điều hướng thẳng vào Dashboard Cá nhân.
  - **Tài khoản Admin:** Điều hướng thẳng vào Dashboard Quản trị Tổng thể.
- **Giao diện hiển thị (UI):**
  - Logo hệ thống đặt ở chính giữa phía trên.
  - Dòng lời chào mừng ngắn gọn bên dưới logo.
  - Ô nhập Tên đăng nhập (Username).
  - Ô nhập Mật khẩu (Password).
  - Nút "Đăng nhập" nổi bật.

---

## 3. PHÂN HỆ DÀNH CHO SALE

### Cấu trúc Layout chung (Sale Workspace)
- **Giao diện hiển thị (UI):**
  - Góc trên bên trái: Hiển thị Tên hệ thống.
  - Ngay bên dưới Tên hệ thống: Hiển thị Tên tài khoản Sale kèm nút `[Đăng xuất]`.
  - Cột menu điều hướng cố định phía dưới gồm 3 mục chính: Dashboard, Quản lý dự trù, Quản lý BBBG.

### 3.1. Dashboard Cá nhân
- **Mô tả nghiệp vụ:** Màn hình tổng quan tiến độ công việc, chỉ số ngân sách và các cảnh báo thuộc khu vực do Sale phụ trách.
- **Ràng buộc logic:** Hệ thống chỉ lọc, tổng hợp và tính toán dữ liệu từ các trường học được Admin gán cho chính Sale đó quản lý.
- **Giao diện hiển thị (UI):**
  - Dòng chữ cá nhân hóa: "Xin chào, [Tên Sale]!".
  - Khối thống kê (Widgets): Hiển thị 5 chỉ số chính:
    1. Số trường quản lý
    2. Số dự trù đã lập
    3. Tổng ngân sách được cấp
    4. Tổng ngân sách đã đầu tư
    5. Tổng chênh lệch ngân sách hiện tại
  - Khối cảnh báo: Chia làm 2 bảng danh sách riêng biệt: Bảng các trường có ngân sách âm (vượt định mức) và Bảng các trường có ngân sách dương (còn dư địa chi tiêu).

### 3.2. Màn hình "Tạo dự trù mới"
- **Mô tả nghiệp vụ:** Màn hình tập trung cho Sale tìm kiếm trường, nhập thông số chỉ tiêu, chọn danh mục vật tư/chi phí và xem kết quả tính toán ngân sách trực quan.
- **Ràng buộc logic:**
  - **Quy đổi ngân sách:** Ngân sách được cấp tự động tính theo công thức:
    $$\text{Ngân sách được cấp} = \text{Số học sinh mới} \times \frac{100.000.000}{105}$$
  - **Nhập số lượng:** Cho phép nhập số thập phân ở cột số lượng thiết bị và đầu tư khác (Ví dụ: `1.5`).
  - **Cảnh báo dự trù cũ:** Nếu trường đã từng xuất dự trù trước đó, hiển thị cảnh báo màu vàng kèm thông tin ngày/giờ xuất bản cũ và tự động load lại toàn bộ dữ liệu cũ.
  - **Kiểm soát đóng băng:** Nếu trường bị Admin khóa, hiển thị cảnh báo màu đỏ và vô hiệu hóa (disable) hoàn toàn nút "Xuất dự trù".
  - **Ràng buộc chống Spam:** Khóa nút "Xuất dự trù" nếu Sale giữ nguyên biểu mẫu mà không có bất kỳ thay đổi về chữ hay số liệu so với bản lưu gần nhất.
  - **Cơ chế xóa dữ liệu:** Trang bị nút "Xóa dữ liệu" để làm sạch biểu mẫu nếu Sale muốn lập lại từ đầu.
- **Giao diện hiển thị (UI):**
  - Khu vực trên cùng: Thanh tìm kiếm thông minh (Auto-suggest định dạng `[Tên trường] - [Địa chỉ]`, chỉ hiển thị trường do Sale đó quản lý).
  - Khu vực trung tâm (Nhập liệu): Tên trường (nổi bật), Địa chỉ (Auto-fill), Ô nhập Tên Hiệu trưởng, Số hợp đồng, Số học sinh cũ, Số học sinh mới (Trường bắt buộc).
  - Khu vực bên phải: Bản xem trước (Live Preview) - cập nhật Realtime tổng ngân sách cấp, ngân sách đã đầu tư (Tổng thiết bị + Đầu tư khác) và chênh lệch ngân sách mỗi khi thêm/sửa/xóa vật tư.
  - Bảng Danh mục Thiết bị: Thanh tìm kiếm thiết bị $\rightarrow$ Bảng chọn gồm các cột: Tên thiết bị, Cấu hình đầy đủ, Số lượng, Đơn giá, Thành tiền.
  - Bảng Danh mục Đầu tư khác: Thanh tìm kiếm danh mục khác $\rightarrow$ Bảng chọn gồm các cột: Tên mục đầu tư, Mô tả, Số lượng, Đơn giá, Thành tiền.
  - Vị trí Nút bấm: Nút `[Xuất dự trù]` nằm ở cuối màn hình (Bị vô hiệu hóa mờ đi nếu trường bị Admin khóa hoặc không có thay đổi dữ liệu).

### 3.3. Quản lý Dự trù (Kho lưu trữ của Sale)
- **Mô tả nghiệp vụ:** Nơi lưu trữ, tìm kiếm và thao tác với toàn bộ các bản dự trù do chính Sale đó tạo ra.
- **Ràng buộc logic:** Sale chỉ được quyền tìm kiếm và truy cập các bản dự trù thuộc sở hữu tài khoản của mình.
- **Giao diện hiển thị (UI):**
  - Khu vực trên cùng: Thanh tìm kiếm nhanh thông minh - khi gõ từ khóa sẽ hiển thị gợi ý và trả kết quả tối giản theo định dạng: `[Tên trường] - [Địa chỉ]`.
  - Khu vực trung tâm: Bảng danh sách các dự trù đã lập. Mỗi dòng hiển thị: Tên trường, Ngày/giờ tạo.
  - Trạng thái trực quan: Hiển thị Icon Ổ khóa 🔒 ngay tại dòng dự trù nếu bản dự trù đó đã bị Admin đóng băng.
  - Cụm nút thao tác trên từng dòng:
    - Nút `[View]`: Bấm vào mở Popup xem chi tiết chứng từ (Tích hợp sẵn nút `[In trực tiếp]` và nút `[Tải xuống PDF/Word]`).
    - Nút `[Xuất BBBG]`: Bấm để chuyển nhanh sang quy trình khởi tạo Biên bản bàn giao.

### 3.4. Quản lý Biên bản bàn giao (BBBG của Sale)
- **Mô tả nghiệp vụ:** Quản lý việc lập và lưu trữ các Biên bản bàn giao thiết bị thực tế sau khi dự trù đã được hoàn tất.
- **Ràng buộc logic:** Danh sách trường khả dụng để xuất BBBG chỉ bao gồm các trường đã xuất dự trù và đã được Admin/IT khóa duyệt. Sale chỉ có quyền thao tác trên các BBBG do chính mình xuất.
- **Giao diện hiển thị (UI):**
  - Khu vực trên cùng: Thanh tìm kiếm nhanh hỗ trợ hiển thị kết quả và gợi ý theo định dạng gọn dữ liệu: `[Tên trường] - [Địa chỉ]`.
  - Khu vực trung tâm: Bảng danh sách tất cả các BBBG mà Sale đã bấm lệnh xuất.
  - Cụm nút thao tác trên từng dòng: Nút `[View]` (Xem trước bản mẫu chuẩn có thông tin trường, danh sách thiết bị bàn giao thực tế, đầu tư khác và khu vực chữ ký), nút `[In trực tiếp]`, và nút `[Tải xuống file]`.

---

## 4. PHÂN HỆ QUẢN TRỊ HỆ THỐNG (ADMIN)

### 4.1. Dashboard Quản trị Tổng thể
- **Mô tả nghiệp vụ:** Báo cáo quản trị vĩ mô toàn bộ hoạt động đầu tư và hiệu suất kinh doanh trên toàn hệ thống.
- **Ràng buộc logic:** Dữ liệu tài chính và chỉ số được tổng hợp Realtime từ tất cả các dự trù/BBG của toàn bộ Sale trên cả nước.
- **Giao diện hiển thị (UI):** Hệ thống biểu đồ trực quan và bảng biểu thống kê: Tổng ngân sách đã cấp toàn quốc, Tổng ngân sách đã giải ngân, Tỷ lệ các trường vượt định mức, Bảng xếp hạng hiệu suất từng nhân viên Sale.

### 4.2. Quản lý User & Vai trò
- **Mô tả nghiệp vụ:** Quản lý toàn bộ tài khoản người dùng và phân cấp quyền hạn trên hệ thống.
- **Ràng buộc logic:** Admin nắm toàn quyền Tạo mới, Chỉnh sửa, Xóa (hoặc ẩn), Khóa/Mở khóa tài khoản, và Cấp vai trò (Sale, Admin...).
- **Giao diện hiển thị (UI):** Thanh tìm kiếm tài khoản ở phía trên; Bên dưới là Bảng danh sách User (Tên, Email, Vai trò, Trạng thái) kèm cụm nút thao tác `[Sửa]`, `[Khóa/Mở]`, `[Xóa]`.

### 4.3. Quản lý Danh mục Trường học
- **Mô tả nghiệp vụ:** Xây dựng cơ sở dữ liệu gốc về tất cả các điểm trường học trên toàn quốc.
- **Ràng buộc logic:**
  - **Ràng buộc bắt buộc:** Khi tạo mới hoặc nhập thêm một trường học vào hệ thống, bắt buộc phải phân quyền chọn một Sale quản lý trực tiếp (Mô hình: Trường nào - Sale nấy quản lý).
  - **Nhập liệu hàng loạt:** Tích hợp nút `[Import Data bằng Excel]` theo file mẫu quy định.
- **Giao diện hiển thị (UI):** Thanh tìm kiếm trường học, Nút `[Import Excel]`, Nút `[Thêm trường mới]`. Bên dưới là Bảng danh sách trường học (Tên trường, Địa chỉ, Sale phụ trách) kèm các nút Thêm/Sửa/Xóa.

### 4.4. Quản lý Danh mục Thiết bị
- **Mô tả nghiệp vụ:** Quản lý kho phần cứng chuẩn để phục vụ cho Sale tra cứu và tính toán dự trù.
- **Ràng buộc logic:** Admin có quyền cập nhật thông tin, cấu hình chi tiết và đơn giá chuẩn áp dụng toàn hệ thống. Tích hợp nút `[Import Data bằng Excel]`.
- **Giao diện hiển thị (UI):** Thanh tìm kiếm thiết bị ở góc trên; Nút `[Import Excel]`. Bên dưới là Bảng danh sách thiết bị (Mã thiết bị, Tên thiết bị, Cấu hình chi tiết, Đơn giá chuẩn) kèm cụm nút Thêm/Sửa/Xóa.

### 4.5. Quản lý Danh mục Đầu tư khác
- **Mô tả nghiệp vụ:** Cấu hình sẵn các danh mục chi phí phi thiết bị (như nhân công, phí vận chuyển, hạ tầng...) mặc định để Sale chọn lựa khi lập dự trù.
- **Ràng buộc logic:** Admin có thể Thêm, Sửa, Xóa các hạng mục chi phí này. Tích hợp nút `[Import Data bằng Excel]`.
- **Giao diện hiển thị (UI):** Thanh tìm kiếm mục đầu tư; Nút `[Import Excel]`. Phía dưới là Bảng danh sách (Tên mục đầu tư, Mô tả chi tiết, Đơn vị tính, Đơn giá chuẩn) kèm các nút thao tác Thêm/Sửa/Xóa.

### 4.6. Kho Dự trù Toàn hệ thống
- **Mô tả nghiệp vụ:** Trung tâm kiểm soát, tra cứu toàn bộ hồ sơ dự trù do tất cả các Sale đã xuất bản trên toàn hệ thống.
- **Ràng buộc logic:**
  - **Hiển thị tổng thể:** Màn hình hiển thị tất cả các bản dự trù mà Sale đã xuất trên toàn hệ thống.
  - **Quyền Khóa dự trù:** Admin có nút thao tác `[Khóa dự trù]` để chính thức đóng băng hồ sơ, tước vĩnh viễn quyền chỉnh sửa của Sale đối với bản dự trù đó.
  - **Bộ lọc thông minh:** Tích hợp nút bật/tắt chế độ "Chỉ hiển thị các bản dự trù mới nhất" để loại bỏ bớt các phiên bản cũ trong lịch sử.
- **Giao diện hiển thị (UI):**
  - Khối bộ lọc phía trên: Ô tìm kiếm nâng cao (Hiển thị kết quả đầy đủ định dạng để phân biệt: `[Tên trường] - [Sale] - [Địa chỉ]`), Dropdown bộ lọc theo từng Sale cụ thể, Nút gạt bật/tắt "Chỉ hiển thị bản mới nhất".
  - Bảng danh sách toàn hệ thống: Hiển thị chi tiết tất cả bản dự trù kèm nút thao tác `[Khóa dự trù]` (hoặc biểu tượng đã khóa).

### 4.7. Kho BBBG Toàn hệ thống
- **Mô tả nghiệp vụ:** Nơi tập trung toàn bộ Biên bản bàn giao thiết bị thực tế của toàn bộ các trường để phục vụ công tác đối soát kế toán và kiểm kê.
- **Ràng buộc logic:** Dữ liệu tự động cập nhật ngay lập tức khi bất kỳ Sale nào thực hiện thao tác xuất BBBG thành công.
- **Giao diện hiển thị (UI):**
  - Khối bộ lọc phía trên: Ô tìm kiếm nâng cao (Hiển thị đầy đủ định dạng: `[Tên trường] - [Sale] - [Địa chỉ]`), Dropdown bộ lọc danh sách theo từng Sale.
  - Bảng danh sách BBBG toàn hệ thống: Cho phép Admin Xem chi tiết, In ấn hoặc Tải xuống bất kỳ file BBBG nào trong hệ thống.
