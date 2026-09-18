# TeachBack AI — demo Mini Hackathon

Prototype học bằng cách **tự giảng lại cho Agent học viên**. App hiện có một learning unit ngắn từ Day 1: **“LLM hoạt động như thế nào?”** (trang PDF 10–12).

## Chạy local

```bash
npm install
copy .env.example .env.local
npm run dev
```

Điền `OPENAI_API_KEY` vào `.env.local`. Model mặc định là `gpt-4o-mini`; có thể đổi bằng `OPENAI_MODEL`.

Mở [http://localhost:3000](http://localhost:3000).

Nếu chưa có API key, app vẫn mở ở **chế độ xem trước** để trình bày UI, nhưng sẽ hiện banner rõ ràng và không được xem là AI chạy thật.

## Luồng demo

1. Mở lesson, giảng LLM khác chatbot như thế nào.
2. Cố tình mô tả sai hoặc xin trợ giúp.
3. Agent học viên chỉ đặt câu hỏi; sau lỗi lặp hoặc khi bạn yêu cầu, chọn **Mời Tutor**.
4. Tutor giải thích ngắn, gắn nút căn cứ; bấm nút để đưa panel PDF đến slide tương ứng.
5. Giảng lại và trả lời câu áp dụng để hoàn thành unit.

## Source grounding

- Full index trích xuất của Day 1 nằm ở `../data/ingested/d1-slide-index.md` và bị Git ignore cùng data pack.
- App dùng `../data/ingested/d1-knowledge-map.json` làm nguồn dữ liệu duy nhất cho mục tiêu học, claim và evidence.
- Route `api/source-pdf` đọc file PDF local từ `../data/slides/d1-slide-hackathon.pdf`; file slide không bị sao chép vào `public/` hay source app.

## Cấu trúc chính

- `../data/ingested/d1-knowledge-map.json`: Knowledge Map, evidence đã review và metadata của bài học.
- `app/api/learn/route.ts`: gọi Agent học viên, sau đó áp dụng policy/state bằng code.
- `app/api/tutor/route.ts`: chỉ gọi Tutor khi user yêu cầu hoặc UI đã đề nghị.
- `app/page.tsx`: lesson picker, chat, progress và PDF song song.

Không có đăng nhập hay database. Trạng thái phiên học được lưu trong `localStorage`; nút **Xóa phiên** xóa trạng thái này.

## Dấu vết kỹ thuật AI

Mỗi phản hồi hiển thị của Agent học viên và Agent trợ giảng có mục **Dấu vết xử lý** để xem mục tiêu, cách xử lý, input đã gửi model và phản hồi thô. Đây là tóm tắt quyết định có thể kiểm chứng, không phải chuỗi suy luận nội bộ.

Ở máy chủ, mọi lần gọi model (kể cả lượt đánh giá JSON) và phản hồi do luật điều phối tạo đều được append theo định dạng JSON Lines vào `storage/ai-traces/YYYY-MM-DD.jsonl`. Mỗi dòng bao gồm timestamp, route, agent, model, objective, system prompt, input prompt, raw response và kết quả đánh giá nếu có. Thư mục này được Git ignore vì có thể chứa nội dung chat của người dùng.
