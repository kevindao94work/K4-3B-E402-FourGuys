# TeachBack AI — demo Mini Hackathon

Prototype học bằng cách **tự giảng lại cho Agent học viên**. App dùng bài Day 1 mới (52 trang), gồm 9 nhóm và 36 mục tiêu.

## Chạy local trên macOS

Cần có Node.js và npm. Từ Terminal, đi vào thư mục `codebase` của dự án:

```bash
cd "/Users/<your-username>/path/to/FourGuys/codebase"
npm install
cp .env.example .env.local
npm run dev
```

Trước khi chạy, mở `.env.local` và điền API key:

```bash
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_LEARN_MODEL=gpt-4o
EVAL_JUDGE_MODEL=gpt-4o
```

Bạn có thể chỉnh file bằng VS Code hoặc chạy `open -a TextEdit .env.local`. Không commit hoặc chia sẻ file này.

Sau đó mở [http://localhost:3000](http://localhost:3000) trong trình duyệt. Dừng server bằng `Control + C` trong Terminal.

Để kiểm tra trước khi chạy, có thể dùng:

```bash
npm run lint
```

Nếu chưa có API key, app vẫn mở ở **chế độ xem trước** để trình bày UI, nhưng sẽ hiện banner rõ ràng và không được xem là AI chạy thật.

## Luồng demo

1. Mở lesson, giảng LLM khác chatbot như thế nào.
2. Cố tình mô tả sai hoặc xin trợ giúp.
3. Agent học viên ghi nhận phần đúng, chỉ ngắn chỗ chưa khớp và hỏi đúng một câu; sau lỗi lặp hoặc khi bạn yêu cầu, chọn **Mời Tutor**.
4. Tutor giải thích ngắn, gắn nút căn cứ; bấm nút để đưa panel PDF đến slide tương ứng.
5. Giảng lại và trả lời câu áp dụng để hoàn thành unit.

## Source grounding

- Full index trích xuất của Day 1 nằm ở `../data/ingested/d1-slide-index.md` và bị Git ignore cùng data pack.
- Knowledge Map và các quote ngắn nằm trong `../data/ingested/d1-knowledge-map.json`; đã rà soát nguồn bằng công cụ, chưa có phê duyệt của con người.
- Route `api/source-pdf` đọc file PDF local từ `../data/slides/day01-llm-foundation-1.pdf`; file slide không bị sao chép vào `public/` hay source app.

## Cấu trúc chính

- `app/lib/server-knowledge-map.ts`: đọc cây và dẫn chứng từ data pack hiện hành.
- `app/api/learn/route.ts`: gọi Agent học viên, sau đó áp dụng policy/state bằng code.
- `app/api/tutor/route.ts`: chỉ gọi Tutor khi user yêu cầu hoặc UI đã đề nghị.
- `app/page.tsx`: lesson picker, chat, progress và PDF song song.

Không có đăng nhập hay database. Trạng thái phiên học được lưu trong `localStorage`; nút **Xóa phiên** xóa trạng thái này.

## Dấu vết kỹ thuật AI

Mỗi phản hồi hiển thị của Agent học viên và Agent trợ giảng có mục **Dấu vết xử lý** để xem mục tiêu và tóm tắt cách xử lý công khai. System prompt, input và phản hồi thô không được gửi vào giao diện. Đây là tóm tắt quyết định có thể kiểm chứng, không phải chuỗi suy luận nội bộ.

Ở máy chủ, mọi lần gọi model (kể cả lượt đánh giá JSON) và phản hồi do luật điều phối tạo đều được append theo định dạng JSON Lines vào `storage/ai-traces/YYYY-MM-DD.jsonl`. Mỗi dòng bao gồm timestamp, route, agent, model, objective, system prompt, input prompt, raw response và kết quả đánh giá nếu có. Thư mục này được Git ignore vì có thể chứa nội dung chat của người dùng.

## Automated golden-set evaluation

Run the app on port 3000, then run `npm run eval` in a second terminal. See [evaluation setup, passing criteria and limitations](../eval/README.md). The pipeline calls the live chatbot and Tutor APIs, tests source loss in an isolated app copy, and writes per-case evidence plus Markdown/JSON reports to `../eval/results/`. Run `npm run eval:test` for the runner's integrity tests.

## Nguồn và cây kiến thức hiện hành

Ứng dụng hiện đọc `../data/ingested/d1-knowledge-map.json`, được tạo lại từ `../data/slides/day01-llm-foundation-1.pdf` (52 trang). Cây gồm 9 nhóm, 36 mục tiêu và 82 ý kiến thức; bản dễ đọc ở `../data/ingested/day01-question-tree.md`. Endpoint PDF lấy tên tệp từ Knowledge Map để nội dung hiển thị và dẫn nguồn cùng một tài liệu. Phiên học mới dùng khóa lưu trữ riêng, tránh dùng lại tiến độ của cây cũ.

## Nút demo trong khung chat

Sau khi bắt đầu trò chuyện, các nút nhỏ **Đúng, đủ / Đúng một phần / Sai / Mơ hồ / Lệch nguồn / Ngoài phạm vi** điền câu mẫu vào ô nhập để người dùng xem, sửa và gửi. Ba chủ đề sampling, xác suất token và harness dùng prompt trong `../eval/demo-prompts.vi.json`; các chủ đề khác lấy ví dụ từ ý kiến thức/ngộ nhận của mục tiêu hiện hành. Nhãn là loại ví dụ dự kiến; agent vẫn đánh giá nội dung qua luồng bình thường.

**Sai ×3 → Tutor** tự gửi ba lần câu mẫu sai, chờ từng phản hồi và truyền trạng thái/lịch sử mới sang lượt tiếp theo, rồi mời Trợ giảng. Đây là các lượt gọi AI thật, có hiển thị tiến độ; không sửa bộ đếm để giả lập kết quả. Nếu có lỗi hoặc phiên bị dừng/hoàn tất, chuỗi dừng lại. Nội dung đang soạn được giữ nguyên.
