# Thu hoạch cá nhân — Đoàn Quang Thanh

> Bản nháp để cá nhân rà soát và xác nhận trước khi nộp.

## Vai trò và phần việc trực tiếp phụ trách

Cả bốn thành viên cùng thảo luận flow trải nghiệm và hướng giải quyết bài toán “học bằng cách dạy lại”. Trong phần triển khai, tôi trực tiếp xây dựng golden set cho các lớp chỗ khó ③ (ngoài phạm vi/thẩm quyền) và ④ (đặc thù domain), cùng hard test và hành vi mong muốn của từng case. Tôi viết/rà soát các case như xin chấm điểm hoặc làm bài thay, nhầm Temperature = 0 với không hallucination, và nhầm cơ chế Top-p với Temperature.

## Tôi đã ứng dụng AI như thế nào

Tôi dùng AI để hỗ trợ kiểm tra schema, phát hiện chỗ trùng lặp trong cách diễn đạt case và chạy giám khảo tự động trên phản hồi của prototype. Việc chọn case nào đáng giữ, xác định rủi ro nếu xử lý sai và định nghĩa hành vi mong muốn vẫn là quyết định của nhóm, được gắn vào User Input Grid thay vì thêm case theo cảm giác.

## Bài học từ failure của nhóm

Tôi nhận ra dùng đúng thuật ngữ không có nghĩa là hiểu đúng. Các case domain cho thấy học viên có thể nói đúng “Temperature” và “Top-p” nhưng vẫn suy ra sai rằng tham số thấp bảo đảm độ đúng hoặc Top-p là phần trăm vocabulary. Vì vậy, một test tốt không chỉ kiểm tra agent có sửa câu sai hay không; nó còn phải yêu cầu người học tự giải thích cơ chế hoặc phản ví dụ. Hiện bộ golden set vẫn cần human review và chưa có 10 case phát triển từ chatlog thật, đây là việc cần ưu tiên trước khi coi kết quả là chính thức.
