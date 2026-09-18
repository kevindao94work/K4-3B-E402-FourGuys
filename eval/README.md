# Đánh giá tự động ExplainLab

[golden-set.json](golden-set.json) là golden set v4 cho app hiện hành và [fixtures.json](fixtures.json) biến từng case thành một lượt gọi API. Bộ gồm **25 case** do nhóm xây dựng, trải trên 19 objective của Knowledge Map Day 1:

- Bảy case ở lớp ① nguồn sự thật; sáu case cho mỗi lớp ② mơ hồ/thiếu thông tin, ③ ngoài phạm vi/thẩm quyền và ④ đặc thù domain.
- Chín case thường gặp, ba case hiếm và 13 case coverage có chủ đích; trong đó 10 case được phát triển từ pattern trong `data/chatlog/tutor_turns.csv`.
- Có một case hoàn tất đúng (`truth-01`), một case mất nguồn cô lập (`truth-05`), hai nhánh Tutor có/không có approved evidence, và các ranh giới bảo mật/thẩm quyền của app.

Tần suất và lớp khó là hai trục khác nhau. Case có `tần suất: "coverage có chủ đích"` không được cộng vào quota thường gặp hoặc hiếm; chúng giữ một ranh giới hành vi cụ thể mà các case tự nhiên dễ bỏ sót.

## Điều kiện đạt

Mỗi phản hồi phải giữ đúng objective, dùng căn cứ hợp lệ của objective đó, xử lý đúng điểm cụ thể, giữ vai Agent Learner và có bước tiếp theo phù hợp. Hầu hết case không được hoàn tất sớm. Riêng case có `"cho phép hoàn tất": true` phải hoàn tất vì người dùng đã chứng minh đủ claim; evaluator kiểm tra ranh giới này bằng `completion_boundary`.

Tutor chỉ được mời khi người dùng xin trợ giúp trực tiếp. Tutor chỉ được tạo lời giải khi objective có approved evidence; với objective chỉ có evidence auto-generated, phản hồi đúng là nêu giới hạn nguồn chứ không bịa lời giải hoặc trích dẫn.

## Chạy

Từ thư mục gốc, chạy `cd codebase`, `npm install`, rồi `npm run dev`. Ở terminal khác tại `codebase`, chạy:

    npm run eval -- --validate
    npm run eval
    npm run eval -- --repeat 3
    npm test

`--validate` kiểm tra ID fixture và objective qua API đang chạy. Một lượt eval thật cần `OPENAI_API_KEY`, có tính phí và sẽ tạo thư mục mới trong `eval/results/`. Báo cáo cũ trong `results/` là lịch sử của golden set v3, không được so sánh trực tiếp với v4 vì fixtures, source và hash đã đổi.

## Trạng thái duyệt

Golden set đã có traceability đến map, slide index, flow route và các pattern chatlog nhưng vẫn có `human_review_status: pending_team_review`. Nhóm cần review/approve wording, expected behavior và nhãn tần suất trước khi dùng làm chuẩn nghiệm thu chính thức.
