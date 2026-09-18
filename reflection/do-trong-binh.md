# Thu hoạch cá nhân — Đỗ Trọng Bình

> Bản nháp để cá nhân rà soát và xác nhận trước khi nộp.

## Vai trò và phần việc trực tiếp phụ trách

Cả bốn thành viên cùng thảo luận flow trải nghiệm và hướng giải quyết bài toán “học bằng cách dạy lại”. Trong phần triển khai, tôi phụ trách tích hợp và xây dựng website/prototype: chọn mục tiêu trong cây kiến thức, màn hình chat dạy lại, hiển thị slide/căn cứ và tiến độ phiên học. Phần việc của tôi là biến flow đã thống nhất thành các thao tác người dùng có thể thực hiện được.

## Tôi đã ứng dụng AI như thế nào

Tôi dùng AI để hỗ trợ rà soát các trạng thái có thể thiếu trong flow, gợi ý cách viết microcopy tiếng Việt cho trạng thái học và kiểm tra tính nhất quán giữa UI với policy của agent. Các quyết định cuối cùng về trạng thái nào được hiển thị, khi nào cho người học quay lại sửa và cách gắn slide/căn cứ vẫn được đối chiếu với `spec.md`, `AGENT_DESIGN.md` và hành vi thật của route API.

## Bài học từ failure của nhóm

Lượt eval giữ lại chỉ đạt `18/26` case; có nhiều case trượt vì bước tiếp theo chưa đủ cụ thể, dù agent đã nhận ra lỗi. Tôi rút ra rằng UI không nên chỉ báo “sai” hoặc “hiểu một phần”: nó phải cho người học biết chính xác việc tiếp theo là gì — sửa một câu, nêu ví dụ, chọn lại mục tiêu hay tải lại nguồn. Nếu giao diện không làm rõ đường lui này, một policy tốt trong code cũng khó trở thành trải nghiệm học hữu ích.
