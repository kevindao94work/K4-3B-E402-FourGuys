# Thu hoạch cá nhân — Nguyễn Văn Thăng

> Bản nháp để cá nhân rà soát và xác nhận trước khi nộp.

## Vai trò và phần việc trực tiếp phụ trách

Cả bốn thành viên cùng thảo luận flow trải nghiệm và hướng giải quyết bài toán “học bằng cách dạy lại”. Trong phần triển khai, tôi phụ trách xây dựng golden set cho lớp ① (nguồn sự thật) và ② (mơ hồ/thiếu thông tin), cùng hard test, User Input Grid và hành vi mong muốn của từng case. Tôi viết/rà soát các case như thiếu nguồn, tuyên bố không có căn cứ trong slide, tham chiếu mơ hồ và thiếu bối cảnh khi chọn Temperature hoặc Top-p; đồng thời hỗ trợ hoàn thiện `spec.md` và đối chiếu kết quả eval với các case đã xây.

## Tôi đã ứng dụng AI như thế nào

Tôi dùng AI để hỗ trợ đề xuất biến thể câu chữ cho test case, kiểm tra schema và phát hiện tổ hợp bị trùng trong User Input Grid. AI không được tự quyết định coverage, tự tạo quote người dùng hay thay thế bước rà soát của con người; nhóm phải chốt ý nghĩa gốc, rủi ro và hành vi mong muốn của từng case trước khi đưa vào golden set.

## Bài học từ failure của nhóm

Kết quả `18/26` cho thấy một phản hồi có vẻ hợp lý vẫn có thể fail nếu agent hỏi sai mắt xích nhân quả hoặc thiếu bước tiếp theo. Ví dụ, `truth-01` chưa buộc người học nối trọng số, phân phối và sampling; `ambiguous-02` từng đoán “nó” là Temperature. Bài học của tôi là không thể đánh giá hệ thống bằng vài demo đẹp: phải kiểm tra output trên case cụ thể, ghi rõ tiêu chí fail và chạy lại toàn bộ bộ test sau mỗi sửa đổi.
