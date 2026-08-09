# Tiệm Tiện Lợi Mỹ Trân

Giao diện đặt hàng trực tuyến đa ngôn ngữ cho Tiệm Tiện Lợi Mỹ Trân. Ứng dụng hỗ trợ chọn giao hàng hoặc tự đến lấy, duyệt danh mục sản phẩm, quản lý giỏ hàng, gửi đơn và quản trị nội dung.

## Công nghệ

- Next.js 16 và React 19
- TypeScript strict
- Tailwind CSS v4
- shadcn/ui và Lucide React
- Express, MySQL 8 và Cloudflare R2

## Chạy dự án

Yêu cầu Node.js 24 trở lên.

```bash
npm install
npm run build
npm start
```

Mở `http://localhost:3000`.

Trang quản trị nằm tại `/admin`. Server đọc cấu hình từ `.env`, tự tạo bảng còn thiếu và chỉ seed catalog ban đầu khi database chưa có cửa hàng.

## Kiểm tra

```bash
npm run check
```

Lệnh này lần lượt chạy ESLint, kiểm tra TypeScript và production build.

## Cấu trúc chính

```text
src/app/          Các route và style toàn cục
src/components/   Thành phần giao diện cửa hàng
src/data/         Dữ liệu danh mục và sản phẩm
src/types/        Kiểu dữ liệu TypeScript
public/images/    Ảnh cửa hàng và sản phẩm
```
