# Minimart

Giao diện đặt hàng trực tuyến bằng tiếng Việt cho Cửa hàng tiện lợi MiniMart. Ứng dụng hỗ trợ chọn giao hàng hoặc tự đến lấy, duyệt danh mục sản phẩm, quản lý giỏ hàng và xác nhận thanh toán.

## Công nghệ

- Next.js 16 và React 19
- TypeScript strict
- Tailwind CSS v4
- shadcn/ui và Lucide React

## Chạy dự án

Yêu cầu Node.js 24 trở lên.

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

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
