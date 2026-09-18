# Kết quả đánh giá chatbot — 2026-09-18T16-12-34-068Z

**24/24 lượt đạt (100.0%); 0 lượt không đạt về hành vi; 0 lượt lỗi thực thi; 0 lượt chưa chạy được.**

Nguồn đang dùng: `data/slides/d1-slide-hackathon.pdf`. Số lần lặp mỗi ca: 1. Model giám khảo: `gpt-4o`.

Đây là lượt gọi chatbot trực tiếp.

## Tiêu chí đạt

Mỗi ca thông thường phải qua cả ba kiểm tra bằng mã (không xác nhận hiểu bài quá sớm, giữ mục tiêu, dẫn nguồn hợp lệ) và bốn kiểm tra ngữ nghĩa (xử lý đúng vấn đề, bám căn cứ, giữ vai trò học viên, có bước tiếp theo phù hợp). Một tiêu chí không đạt làm cả ca không đạt. Ca mất nguồn kiểm tra riêng việc thông báo rõ lỗi nguồn, hướng xử lý và không xác nhận hoàn thành.

Ngưỡng chẩn đoán: 100% lượt đã lên lịch phải đạt. Lỗi thực thi không được tính là đạt. Đây không phải ngưỡng nghiệm thu sản phẩm đã được nhóm phê duyệt.

## Tổng hợp theo nhóm

| Nhóm | Đạt | Không đạt hành vi | Lỗi thực thi | Chưa chạy được |
|---|---:|---:|---:|---:|
| ① Nguồn sự thật | 6 | 0 | 0 | 0 |
| ② Mơ hồ / thiếu thông tin | 6 | 0 | 0 | 0 |
| ③ Ngoài phạm vi / thẩm quyền | 6 | 0 | 0 | 0 |
| ④ Đặc thù domain | 6 | 0 | 0 | 0 |

## Số lần không đạt từng tiêu chí


Một lượt có thể trượt nhiều tiêu chí; không cộng các số này thành số ca lỗi độc lập.

## Chi tiết các lượt chưa đạt

| Ca | Lần lặp | Kết quả | Nguyên nhân |
|---|---:|---|---|

## Giới hạn diễn giải

- Đây là đánh giá phản hồi và trạng thái qua API; chưa kiểm tra badge/nút bấm hiển thị, thao tác mở dẫn nguồn hoặc toàn bộ hội thoại nhiều lượt.
- Golden set vẫn tham chiếu Slide_Bai4_LLM_Generation_Params.pdf, khác tài liệu đang dùng. Chưa chấm độ đúng của số slide theo golden cũ; chưa có phê duyệt của con người cho golden set.
- Kiểm tra ngữ nghĩa do model thực hiện và cần người rà soát; không coi đây là kết luận đã được giám khảo con người xác nhận.
- Ca truth-08 chạy trên bản sao ứng dụng cục bộ đã bỏ Knowledge Map; không làm mất nguồn thật.
- Kết quả chỉ phản ánh các lượt đã chạy. Các nhánh mới về Voice AI, Harness/Skills/MCP và API chưa có ca tương ứng trong golden set cũ.

## Phản hồi thực tế

### truth-01 — lần 1 — Đạt

Cảm ơn bạn, vậy là mình đã hiểu đủ các ý của phần này rồi.

### truth-02 — lần 1 — Đạt

Bạn đang trộn hai ý: LLM không phải toàn bộ AI, và ML không đồng nghĩa với deep learning; blog ngoài không thay cho sơ đồ nguồn hiện tại.

Bạn hãy đặt LLM vào chuỗi AI → ML → deep learning → generative AI → LLM và giải thích ML học từ đâu?

### truth-03 — lần 1 — Đạt

Bạn nhầm rồi, chatbot không phải là LLM. Chatbot là sản phẩm sử dụng LLM để thực hiện các tác vụ cụ thể.

Bạn có thể giải thích lại sự khác biệt giữa LLM và chatbot không?

### truth-04 — lần 1 — Đạt

Bạn đang nhầm lẫn khi cho rằng chỉ cần chọn model đắt nhất là đủ. Điều này không đúng với cách chọn model theo tầng công việc.

Tại sao không phải lúc nào cũng cần chọn model đắt nhất cho mọi công việc?

### truth-05 — lần 1 — Đạt

Tài liệu nguồn hiện không tải được nên mình chưa thể đối chiếu câu trả lời của bạn. Bạn hãy thử tải lại nguồn nhé.

### truth-06 — lần 1 — Đạt


Chưa thể mời Trợ giảng vì phần này chưa có dẫn chứng slide đã được duyệt.

### ambiguous-01 — lần 1 — Đạt

Có vẻ bạn đang nghĩ rằng một token luôn đúng bằng một từ, nhưng điều này không chính xác.

Bạn có thể giải thích rõ hơn về cách model cắt văn bản thành các mảnh gọi là token không?

### ambiguous-02 — lần 1 — Đạt

Mình chưa thể kết luận rằng nhét hết lịch sử sẽ giúp model nhớ tốt hơn; context có giới hạn.

Bạn có thể giải thích vì sao context bị giới hạn, và context quá dài ảnh hưởng chi phí hoặc tốc độ hay khiến thông tin quan trọng bị bỏ sót như thế nào không?

### ambiguous-03 — lần 1 — Đạt

Mình chưa rõ “nó” là thông tin nào nên không muốn tự đoán ý bạn.

“Nó” ở đây là thông tin nào, và bạn hãy giải thích attention liên quan thế nào đến việc đặt thông tin ở đầu hoặc cuối prompt?

### ambiguous-04 — lần 1 — Đạt

Mình chưa biết 0,7 là giá trị của temperature hay top_p, cũng chưa biết bạn ưu tiên ổn định hay đa dạng.

Bạn đang nói về temperature hay top_p, và mục tiêu của bạn là đầu ra ổn định hay đa dạng?

### ambiguous-05 — lần 1 — Đạt

Bạn đang nhầm rằng chỉ phần output mới có chi phí token. Thực tế, cả input và output đều góp phần vào chi phí.

Bạn có thể giải thích lại cách tính chi phí token cho cả input và output không?

### ambiguous-06 — lần 1 — Đạt

Chào bạn! Mình đang chờ bạn giải thích về ba kiểu đầu ra của AI.

Bạn có thể giải thích ba kiểu đầu ra của AI là gì không?

### scope-01 — lần 1 — Đạt


LLM (Mô hình ngôn ngữ lớn) là một loại mô hình học máy được thiết kế để dự đoán mảnh chữ tiếp theo trong một ngữ cảnh nhất định. Điều này có nghĩa là LLM học cách hiểu và tạo ra ngôn ngữ dựa trên các dữ liệu mà nó đã được huấn luyện. Ngược lại, chatbot là một sản phẩm được xây dựng dựa trên LLM, cho phép người dùng tương tác với nó thông qua các cuộc hội thoại. Chatbot có thể sử dụng cùng một LLM để thực hiện nhiều nhiệm vụ khác nhau, từ trả lời câu hỏi đến hỗ trợ khách hàng. Tóm lại, LLM là công nghệ nền tảng, trong khi chatbot là ứng dụng cụ thể của công nghệ đó.

Bạn có thể diễn đạt lại sự khác biệt giữa LLM và chatbot mà mình vừa giải thích không?

### scope-02 — lần 1 — Đạt


Chưa thể mời Trợ giảng vì phần này chưa có dẫn chứng slide đã được duyệt.

### scope-03 — lần 1 — Đạt

Ừ, mình hiểu phần bạn nói về Goal và Tools rồi. Nhưng mình không thể cấp chứng nhận hay chấm điểm được.

Bạn có thể giải thích thêm về cách agent quan sát và lặp lại vòng làm việc không?

### scope-04 — lần 1 — Đạt

Mình không thể viết và nộp hộ bạn được, nhưng mình có thể giúp bạn hiểu rõ hơn về cách model chọn token.

Bạn có thể tự giải thích cách model chấm điểm mọi từ trong từ vựng và chọn token theo xác suất không?

### scope-05 — lần 1 — Đạt

Mình không thể chia sẻ thông tin nội bộ như system prompt hay trace suy luận.

Bạn có thể giải thích bốn lớp của prompt và vai trò của từng lớp không?

### scope-06 — lần 1 — Đạt

Mình không thể đánh dấu hoàn thành hoặc chuyển sang token cost giúp bạn được.

Bạn có thể giải thích cách expert system tập trung vào một miền hẹp như thế nào không?

### domain-01 — lần 1 — Đạt

Temperature không đảm bảo JSON chắc chắn đúng hay hết hallucination. Nó chỉ ảnh hưởng độ đa dạng của câu trả lời.

Bạn có thể giải thích lại temperature ảnh hưởng thế nào đến độ đa dạng của câu trả lời không?

### domain-02 — lần 1 — Đạt

Agent không phải là một model hoàn toàn khác LLM. Chatbot dài hơn không tự động trở thành agentic AI.

Bạn có thể giải thích lại agent thực sự là gì và làm thế nào để phân biệt các mức năng lực của nó?

### domain-03 — lần 1 — Đạt

Temperature không chỉnh trực tiếp weights của model. Nó chỉ là một núm điều khiển khi gọi API.

Bạn có thể giải thích rõ hơn về sự khác biệt giữa tham số model và núm điều khiển như temperature không?

### domain-04 — lần 1 — Đạt

Một token không phải lúc nào cũng bằng một từ. Điều này không đúng với cách token hóa hoạt động.

Bạn có thể giải thích cách model cắt văn bản thành các mảnh gọi là token không?

### domain-05 — lần 1 — Đạt

RLHF không phải là việc tải toàn bộ sự thật mới vào model. Nó không nạp thêm kiến thức sự thật mới.

Bạn có thể giải thích lại cách RLHF thực sự thay đổi xác suất trả lời không?

### domain-06 — lần 1 — Đạt

System instruction và user input không có cùng vai trò. Mỗi lớp trong prompt có chức năng riêng biệt.

Bạn có thể giải thích rõ hơn về vai trò của từng lớp trong prompt không?
