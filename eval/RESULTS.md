# Kết quả sau khi đồng bộ giao diện và sửa luồng teach-back

Ngày 18/09/2026. Nguồn hiện hành: `day01-llm-foundation-1.pdf`, 52 trang; cây có 9 nhóm, 36 mục tiêu, 82 ý kiến thức và 82 dẫn chứng.

**Lượt chạy chính: 18/26 ca đạt (69,2%); 8 ca không đạt hành vi; 0 lỗi thực thi; 0 ca bỏ qua.** Mỗi ca chạy một lần. Chưa qua ngưỡng chẩn đoán 100%.

## Tiêu chí đạt

Mỗi ca thông thường phải đạt cả bảy tiêu chí: không xác nhận hiểu bài quá sớm; giữ đúng mục tiêu; dẫn nguồn tồn tại trong mục tiêu hiện hành; giải quyết đúng vấn đề cụ thể; bám căn cứ; để người dùng tự giải thích; có bước tiếp theo phù hợp. Ca mất nguồn kiểm tra riêng thông báo lỗi nguồn, đường thử/tải lại và không cấp hoàn thành. Một tiêu chí trượt làm cả ca trượt; lỗi thực thi không được tính là đạt.

## Tám ca không đạt và nguyên nhân

| Ca | Nguyên nhân quan sát được |
|---|---|
| `truth-01` | Hỏi tác động của temperature, chưa kiểm tra quan hệ giữa trọng số cố định, phân phối và lựa chọn ngẫu nhiên. |
| `truth-03` | Hỏi độ đa dạng nhưng chưa nối phân phối tập trung với tác vụ cần đầu ra ổn định. |
| `ambiguous-02` | Tự đoán “nó” là temperature thay vì hỏi tham số nào. |
| `ambiguous-03` | Tự chọn temperature thấp, chưa làm rõ tham số và tác vụ. |
| `ambiguous-04` | Hỏi 0,7 là tham số nào nhưng thiếu bối cảnh sử dụng và mục tiêu đầu ra. |
| `ambiguous-07` | Sửa ngộ nhận tự học Internet nhưng chưa yêu cầu người dùng tự phân biệt cơ chế một cách đầy đủ. |
| `ambiguous-08` | Chỉ ra temperature thấp không bảo đảm đúng nhưng chưa yêu cầu người dùng tự sửa kết luận bằng lập luận hoặc phản ví dụ. |
| `domain-01` | Sửa tuyên bố temperature = 0 bảo đảm đúng, nhưng câu tiếp theo chưa kiểm tra rõ yêu cầu JSON/định dạng. |

Có **5 lần trượt tiêu chí xử lý đúng vấn đề** và **8 lần trượt bước tiếp theo**. Các số này chồng lấn trên 8 ca, không phải 13 ca độc lập. Không có lỗi ở các tiêu chí còn lại trong lượt này.

## Phương pháp và phạm vi của đợt chạy

Đợt duy nhất được giữ: `2026-09-18T09-32-20-979Z`, mỗi ca chạy một lần. Agent đánh giá và giám khảo dùng `gpt-4o`; model mở đầu/Tutor được cấu hình là `gpt-4o-mini`. Giám khảo vượt qua 5/5 ca kiểm soát trước khi chấm. Các kết quả cũ, chấm lại và demo đã được xóa theo yêu cầu.

Kết quả phản ánh mã nguồn tại thời điểm chạy; chưa phải lần đánh giá toàn bộ sau các thay đổi mới hơn như sửa bộ lọc từ hoặc thêm nút demo.

## Giới hạn

- Golden vẫn dựa trên slide cũ và chưa có phê duyệt của con người; kết quả là chẩn đoán tự động, `officialGatePassed=false`.
- Golden chỉ phủ hai mục tiêu xác suất token và sampling. Chưa đại diện cho toàn bộ 36 mục tiêu, độ đúng số trang theo slide cũ hoặc mọi hội thoại nhiều lượt.
- Một lần chạy mỗi ca không đo được độ ổn định dài hạn. Model và giám khảo đều có thể biến thiên; các lỗi còn lại cần tiếp tục cải thiện.
- Kiểm tra mất nguồn dùng bản sao ứng dụng cô lập, không xóa nguồn đang dùng.

## Tệp sử dụng

- [Báo cáo đầy đủ bằng tiếng Việt](results/2026-09-18T09-32-20-979Z/report.md)
- [Log phản hồi và phán quyết từng ca](results/2026-09-18T09-32-20-979Z/cases.jsonl)
- [Cách chạy và tiêu chí](README.md)
