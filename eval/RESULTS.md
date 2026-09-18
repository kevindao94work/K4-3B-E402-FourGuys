# Đánh giá tự động ExplainLab

`golden-set.json` là golden set v4 cho app hiện hành và `fixtures.json` biến từng case thành một lượt gọi API. Bộ hiện gồm **25 case**:

- 7 case cho lớp ① nguồn sự thật; 6 case cho mỗi lớp ② mơ hồ/thiếu thông tin, ③ ngoài phạm vi/thẩm quyền và ④ đặc thù domain.
- 9 case thường gặp, 3 case hiếm và 13 case coverage có chủ đích. Tần suất và lớp khó là hai trục độc lập.
- 10 case được phát triển từ pattern chatlog thật; riêng `truth-07` trỏ về lượt `T02750`.
- Có case hoàn tất đúng (`truth-01`), case mất nguồn cô lập (`truth-05`), nhánh Tutor có/không có approved evidence và các ranh giới bảo mật/thẩm quyền.

## Điều kiện đạt

Mỗi case phải giữ đúng objective, dùng căn cứ hợp lệ, xử lý đúng vấn đề, giữ vai Agent Learner và đưa ra bước tiếp theo phù hợp. Hầu hết case không được hoàn tất sớm; riêng case có `"cho phép hoàn tất": true` phải hoàn tất khi người dùng đã chứng minh đủ claim. Một case chỉ được tính pass khi toàn bộ kiểm tra pass; `error` và `blocked` không được tính là đạt.

Tutor chỉ được mời khi người dùng xin trợ giúp trực tiếp. Tutor chỉ được tạo lời giải khi objective có approved evidence; với evidence chỉ `auto_generated`, phản hồi đúng là nêu giới hạn nguồn, không bịa lời giải hoặc quote.

## Quality bar và kết quả mới nhất

Quality bar chẩn đoán: **100% case đã lên lịch pass, 0 error, 0 blocked và mỗi lớp đạt theo đủ số case hiện hành**. Lượt `2026-09-18T18-11-40-737Z` đạt **25/25 = 100,0%**, 0 fail, 0 error, 0 blocked; bốn lớp đạt lần lượt 7/7, 6/6, 6/6, 6/6; `responseGatePassed = true`.

Đây chưa phải official gate: `human_review_status` vẫn là `pending_team_review`, semantic verdict chưa được người thứ hai xác nhận, và mỗi case mới chạy một lượt. Các báo cáo 18/26 của golden set/nguồn cũ không so sánh trực tiếp với v4 hiện hành.

Xem [báo cáo đầy đủ](results/2026-09-18T18-11-40-737Z/report.md), [JSON](results/2026-09-18T18-11-40-737Z/report.json) và [log từng case](results/2026-09-18T18-11-40-737Z/cases.jsonl).

## Chạy

Từ thư mục gốc, chạy `cd codebase`, `npm install`, rồi `npm run dev`. Ở terminal khác tại `codebase`, chạy:

    npm run eval -- --validate
    npm run eval
    npm run eval -- --repeat 3
    npm test

`--validate` kiểm tra ID fixture và objective qua API đang chạy. Một lượt eval thật cần `OPENAI_API_KEY`, có tính phí và tạo thư mục mới trong `eval/results/`.

## Trạng thái duyệt

Golden set đã có traceability đến Knowledge Map, slide index, flow route và pattern chatlog. Nhóm vẫn cần review/approve wording, expected behavior và nhãn tần suất trước khi dùng làm chuẩn nghiệm thu chính thức.
