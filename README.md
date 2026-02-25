# Stock Reader - Trợ lý đọc lệnh FireAnt

Dự án này là một Extension dành cho trình duyệt (Chrome/Edge) giúp tự động đọc các lệnh giao dịch chứng khoán từ bảng giá FireAnt bằng giọng nói (Text-to-Speech).

## Tính năng

- **Theo dõi thời gian thực:** Sử dụng `MutationObserver` để giám sát thay đổi trên sổ lệnh (Order Book) của FireAnt.
- **Đọc lệnh bằng giọng nói:** Tự động đọc to thông tin lệnh mới khớp:
  - Phân loại lệnh: Mua (M), Bán (B), hoặc Khớp lệnh định kỳ.
  - Đọc khối lượng và giá khớp.
  - Giọng đọc tiếng Việt (vi-VN).
- **Chống đọc trùng:** Có cơ chế kiểm tra `lastTradeKey` để đảm bảo không đọc lại các lệnh cũ đã phát.
- **Tự động kết nối:** Tự động thử lại (reload) nếu giao diện web chưa tải xong dữ liệu.

## Cấu trúc dự án

- `content.js`: Script chính chứa logic theo dõi DOM và xử lý giọng nói.

## Hướng dẫn cài đặt

Để chạy script này dưới dạng Chrome Extension, bạn cần thực hiện các bước sau:

1. **Chuẩn bị file Manifest:**
   Tạo thêm một file tên là `manifest.json` trong cùng thư mục với nội dung sau:

   ```json
   {
     "manifest_version": 3,
     "name": "Stock Reader",
     "version": "1.0",
     "description": "Đọc lệnh chứng khoán từ FireAnt",
     "permissions": ["activeTab"],
     "content_scripts": [
       {
         "matches": ["https://fireant.vn/*"],
         "js": ["content.js"]
       }
     ]
   }
   ```

2. **Load vào trình duyệt:**
   - Mở Chrome hoặc Edge và truy cập địa chỉ: `chrome://extensions/`
   - Bật chế độ **Developer mode** (Chế độ nhà phát triển).
   - Chọn **Load unpacked** (Tải tiện ích đã giải nén) và chọn thư mục chứa dự án này.

## Lưu ý

- **Mã cổ phiếu:** Mã nguồn hiện tại đang được cấu hình cứng để đọc tên mã **IJC** trong câu thoại. Bạn cần mở đúng tab IJC hoặc sửa lại code nếu muốn dùng cho mã khác.
- **Giao diện:** Script phụ thuộc vào cấu trúc HTML cụ thể của FireAnt (`virtuoso-item-list`). Nếu trang web cập nhật giao diện, script có thể cần được bảo trì.
