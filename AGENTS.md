<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.

This block is written and re-added by `next dev`. Removing it from a diff only re-creates the uncommitted change.

<!-- END:nextjs-agent-rules -->

# Minimart

Giao diện đặt hàng trực tuyến cho Cửa hàng tiện lợi MiniMart.

## Tech Stack

- Next.js 16, App Router, React 19 và TypeScript strict.
- Tailwind CSS v4 và shadcn/ui.
- Lucide React cùng các biểu tượng SVG nội bộ.

## Commands

- `npm run dev` — chạy môi trường phát triển.
- `npm run build` — tạo production build.
- `npm run lint` — kiểm tra ESLint.
- `npm run typecheck` — kiểm tra TypeScript.
- `npm run check` — chạy lint, typecheck và build.

## Code Style

- TypeScript strict, không dùng `any`.
- Named exports, component PascalCase và utility camelCase.
- Tailwind utility classes, hạn chế inline styles.
- Mobile-first và phải tương thích cả mobile lẫn desktop.

## Product Rules

- Nội dung khách hàng nhìn thấy ưu tiên tiếng Việt.
- Giữ đúng phạm vi thay đổi được yêu cầu.
- Không thay đổi luồng đặt hàng, giỏ hàng hoặc thanh toán nếu không được yêu cầu.
- Sau khi thay đổi, chạy `npm run check` và kiểm tra UTF-8.
