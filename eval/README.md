# Đánh giá tự động chatbot

Pipeline gửi câu hỏi tiếng Việt đến API thật của ứng dụng trong `codebase`, đối chiếu phản hồi và trạng thái học với 26 tình huống trong [golden-set.json](golden-set.json). [fixtures.json](fixtures.json) chuyển các tình huống thành lời nhắn, lịch sử hội thoại và mục tiêu cụ thể; chatbot không nhận đáp án tham chiếu khi trả lời.

Kết quả được giữ lại: **18/26 ca đạt (69,2%), 8 ca chưa đạt về hành vi, 0 lỗi thực thi**, mỗi ca chạy một lần. Xem [tóm tắt kết quả](RESULTS.md) hoặc [báo cáo đầy đủ](results/2026-09-18T09-32-20-979Z/report.md). Thư mục `results/` chỉ giữ đợt này theo yêu cầu; các kết quả trước và kết quả demo đã được xóa.

## Chuẩn “đạt” của nhóm là gì?

Một ca thông thường phải đáp ứng đủ bảy yêu cầu:

1. **Không xác nhận hiểu bài quá sớm:** phải làm rõ hoặc kiểm tra nhân quả/áp dụng trước khi hoàn thành.
2. **Giữ đúng mục tiêu:** không tự chuyển chủ đề học.
3. **Dẫn nguồn hợp lệ:** trang và mã slide được trả về phải nằm trong dẫn chứng của mục tiêu hiện hành.
4. **Xử lý đúng vấn đề:** hỏi vào ngộ nhận, điểm mơ hồ hoặc yêu cầu cụ thể của người dùng.
5. **Bám căn cứ:** không bịa hoặc đồng tình với tuyên bố thiếu chứng cứ.
6. **Giữ vai trò học viên:** để người dùng tự giảng lại, không cung cấp toàn bộ đáp án thay họ.
7. **Có bước tiếp theo phù hợp:** yêu cầu giải thích, sửa sai, làm rõ hoặc khôi phục nguồn.

Ba tiêu chí đầu được kiểm tra bằng mã; bốn tiêu chí sau do model giám khảo chấm và ghi lý do bằng tiếng Việt. Chỉ một tiêu chí trượt thì cả ca chưa đạt. Riêng `truth-08` kiểm tra mất nguồn: phải thông báo rõ vấn đề tài liệu, hướng dẫn thử/tải lại và không xác nhận hoàn thành.

**Ngưỡng của pipeline là 100% ca đạt; lỗi thực thi hoặc ca chưa chạy được không tính là đạt.** Đây là ngưỡng chẩn đoán đang dùng, chưa phải chuẩn nghiệm thu chính thức được nhóm phê duyệt. Golden set chưa có duyệt của con người nên `officialGatePassed` vẫn là `false`.

## Những lần chưa đạt sai ở đâu?

Tám ca chưa đạt tập trung vào ba vấn đề:

- **Hỏi chưa đúng mắt xích nhân quả:** `truth-01`, `truth-03` hỏi chung về temperature/độ đa dạng, chưa nối trọng số–sampling hoặc cơ chế–yêu cầu tác vụ.
- **Làm rõ chưa đủ:** `ambiguous-02`, `ambiguous-03`, `ambiguous-04` đoán tham số hoặc chưa hỏi đủ bối cảnh và mục tiêu sử dụng.
- **Sửa sai nhưng bước tiếp theo còn thiếu:** `ambiguous-07`, `ambiguous-08`, `domain-01` chưa yêu cầu người dùng tự phân biệt cơ chế, sửa kết luận hoặc kiểm tra yêu cầu định dạng.

Có **5 lượt trượt tiêu chí xử lý đúng vấn đề** và **8 lượt trượt bước tiếp theo**. Hai nhóm chồng lấn trên 8 ca, không cộng thành 13 ca độc lập. Chi tiết phản hồi và lý do chấm nằm trong báo cáo được giữ lại.

## Cách chạy

Cần Node.js 22.18 trở lên, các thư viện trong `codebase`, Knowledge Map tại `data/ingested/d1-knowledge-map.json`, PDF nguồn trong `data/slides/` và `OPENAI_API_KEY` trong `codebase/.env.local` hoặc biến môi trường. Các lượt gọi model thật có tính phí.

Từ thư mục gốc dự án:

```sh
cd codebase
npm install
npm run dev
```

Mở terminal thứ hai tại `codebase`:

```sh
# Kiểm tra dữ liệu và ánh xạ mục tiêu trước khi chấm
npm run eval -- --validate

# Chạy 26 ca trên ứng dụng tại cổng 3000
npm run eval

# Lặp mỗi ca 3 lần để quan sát tính biến thiên
npm run eval -- --repeat 3

# Chỉ định địa chỉ ứng dụng khác
npm run eval -- --base-url http://127.0.0.1:3000

# Kiểm thử bộ chấm và quy tắc chuyển trạng thái học
npm test
```

Chỉ chạy một máy chủ Next.js trên cùng thư mục dự án. Chạy đánh giá tuần tự để tránh tranh chấp hạn mức API. Mặc định mỗi ca cách nhau 12 giây, có thể chỉnh bằng `--interval-ms`. SDK thử lại hữu hạn với lỗi tạm thời; không chạy lại ca trượt hành vi để chọn kết quả tốt hơn. Số lỗi thực thi trong báo cáo là số ca còn lỗi sau các lần thử lại.

Lệnh trả mã thoát `0` khi tất cả ca đạt, `1` khi có ca trượt/lỗi/chưa chạy được hoặc lỗi thiết lập. Có thể dùng làm bước kiểm tra tự động sau khi khởi động ứng dụng và cung cấp đủ dữ liệu nguồn riêng của dự án.

## Cấu hình và kiểm tra giám khảo

- `OPENAI_LEARN_MODEL`: model đánh giá lời giải thích; đợt được giữ lại dùng `gpt-4o`.
- `OPENAI_MODEL`: model tạo câu hỏi mở đầu và Tutor; cấu hình của đợt này là `gpt-4o-mini`.
- `EVAL_JUDGE_MODEL`: model giám khảo, mặc định `gpt-4o`.

Trước khi chấm, giám khảo phải vượt qua 5 ca kiểm soát với phản hồi đúng/sai đã xác định. Nếu không đạt, pipeline dừng. Đợt 18/26 vượt qua 5/5 ca kiểm soát. Đây chỉ là bước phát hiện lỗi chấm rõ ràng, không thay thế rà soát của con người.

Có thể chấm lại một bộ phản hồi đã lưu bằng cùng giám khảo:

```sh
npm run eval -- --replay ../eval/results/2026-09-18T09-32-20-979Z/cases.jsonl
```

Chế độ này kiểm tra mã băm golden, fixtures và Knowledge Map phải khớp; giữ nguyên lỗi thực thi gốc và không gọi lại chatbot để tạo phản hồi thay thế. Mỗi lần chạy hoặc chấm lại sẽ tạo thư mục kết quả mới.

## Tệp kết quả

Mỗi đợt tạo một thư mục theo thời gian trong `eval/results/`, gồm:

| Tệp | Nội dung |
|---|---|
| `metadata.json` | Model, phiên bản giám khảo, mã băm dữ liệu, phiên bản mã nguồn và giới hạn đánh giá. |
| `calibration.json` | Kết quả 5 ca kiểm soát giám khảo. |
| `cases.jsonl` | Yêu cầu, phản hồi thật, trạng thái, phán quyết và thời gian từng ca. |
| `report.json` | Tổng số ca đạt/trượt/lỗi và thống kê theo nhóm, tiêu chí. |
| `report.md` | Báo cáo tiếng Việt, nguyên nhân chưa đạt và phản hồi từng ca. |

Ca mất nguồn chạy trên bản sao ứng dụng trong thư mục tạm đã bỏ Knowledge Map; nguồn thật không bị thay đổi. Khi dùng `--base-url` từ xa, phép thử mất nguồn vẫn diễn ra trên bản sao cục bộ.

## Kiểm tra demo bổ sung

Lệnh `npm run eval:demo` dùng [demo-prompts.vi.json](demo-prompts.vi.json), gồm 9 câu mẫu đúng, đúng một phần và sai cho các chủ đề sampling, xác suất token và harness. Kết quả demo không cộng vào điểm 26 ca golden.

## Giới hạn diễn giải

- Golden tham chiếu `Slide_Bai4_LLM_Generation_Params.pdf`; ứng dụng dùng `day01-llm-foundation-1.pdf` gồm 52 trang. Pipeline đối chiếu dẫn chứng hiện hành, chưa chấm độ đúng số trang theo slide cũ.
- 26 ca chỉ phủ hai mục tiêu `probabilistic-next-token` và `sampling-controls`, chưa đại diện cho toàn bộ 36 mục tiêu.
- Đây là kiểm tra phản hồi và trạng thái qua API, chưa kiểm tra đầy đủ giao diện hoặc hội thoại nhiều lượt.
- Điểm ngữ nghĩa do model chấm, chưa được con người xác nhận. Một lượt chạy mỗi ca không chứng minh độ ổn định dài hạn.
- Kết quả được giữ lại phản ánh phiên bản tại thời điểm chạy, không tự chứng nhận các thay đổi giao diện hoặc mã nguồn sau đó.
