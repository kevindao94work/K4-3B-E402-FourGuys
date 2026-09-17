# ExplainLab — Prototype Giao Diện CP2 (Lab AI20k)

> **Track D3: Học bằng cách dạy (Learning by Teaching)**  
> **Kiến trúc:** Hệ thống 2 LLMs — **1 LLM Học viên** & **1 LLM Trợ giảng**  
> **Mục đích:** Chứng minh luồng trải nghiệm người học dạy lại bài cho AI sau khi hoàn thành buổi học trên VLearn.  
> **Lưu ý:** Toàn bộ phản hồi hiện tại là kịch bản giả lập chuẩn hóa (mock data), không sử dụng API key và chưa kết nối backend AI thật.

---

## 1. Bối cảnh & Luồng nghiệp vụ (Flow 2 LLMs)

Sau khi học xong mỗi bài trên VLearn, người học mở mục **“Ôn tập bằng AI”**:

```
[Màn hình 1: Đề tài ôn tập]
  • LLM Học viên đọc slide bài vừa học (Slide_Bai4_LLM_Generation.pdf)
  • Tạo danh sách 3 đề tài cần người học giảng dạy lại
        │
        ▼ (Bấm "Bắt đầu buổi dạy cho AI →")
[Màn hình 2: Phòng dạy học tương tác (2 LLMs)]
  • LLM Học viên hỏi từng câu theo từng lượt
  • Người học nhập lời giải thích hoặc chọn nút giả lập
  • Hệ thống có khoảng dừng tự nhiên ("Học viên AI đang đọc và đối chiếu slide...")
  • LLM Học viên chấm độ hoàn thiện theo 4 nhánh:
      1. Đủ ý: Ghi nhận hiểu bài, dừng lại để người học đọc phản hồi, hiển thị nút "Chuyển sang Đề tài tiếp theo →".
      2. Thiếu ý: Hỏi thêm gợi ý để dẫn dắt học viên đến câu trả lời đúng (người học tiếp tục giải thích bổ sung).
      3. Sai kiến thức: Chỉ ra chỗ sai và hỏi lại học viên (người học tiếp tục sửa lại).
      4. Sai lặp lại 3 lần: LLM Trợ giảng xuất hiện, giảng giải ngắn gọn dựa trên Slide nguồn, dừng lại để người học đọc kỹ bài giảng trước khi bấm chuyển tiếp.
        │
        ▼ (Người học chủ động bấm chuyển câu sau khi đã đọc xong)
[Màn hình 3: Dashboard tổng kết]
  • Giải thích được những gì (Điểm mạnh đã đạt chuẩn)
  • Còn chưa được những gì (Điểm còn lúng túng hoặc cần can thiệp)
  • Cần ôn tập lại gì (Khuyến nghị số trang slide và khái niệm cần đọc lại)
```

---

## 2. Các công cụ hỗ trợ kiểm thử nhanh (Quick Simulation)

Tại **Màn hình 2 (Phòng dạy học)**, có sẵn 4 nút giả lập nhanh để người chấm/giám khảo kiểm thử ngay lập tức cả 4 kịch bản mà không cần tự gõ tay:

| Nút bấm | Hành vi kiểm thử |
|---|---|
| **Thử trả lời: Đủ ý** | Người học giải thích chuẩn xác phân phối xác suất và sampling $\rightarrow$ LLM Học viên xác nhận đã hiểu và chuyển câu tiếp theo. |
| **Thử trả lời: Thiếu ý** | Người học trả lời còn chung chung $\rightarrow$ LLM Học viên đặt câu hỏi gợi mở để học viên bổ sung. |
| **Thử trả lời: Sai** | Người học trả lời sai bản chất $\rightarrow$ LLM Học viên đối chiếu slide và chỉ ra chỗ sai, yêu cầu giải thích lại. |
| **Sai 3 lần $\rightarrow$ Gọi Trợ giảng** | Giả lập sai liên tiếp 3 lần $\rightarrow$ **LLM Trợ giảng** xuất hiện, tóm lược kiến thức cốt lõi từ Slide nguồn để gỡ rối cho học viên. |

---

## 3. Phong cách thiết kế (Clean Slate Minimalist)

- **Chuẩn phong cách:** Lấy cảm hứng từ Shadcn UI và Linear Design System.
- **Màu sắc:** 100% màu phẳng (Flat colors), không sử dụng gradient, không bóng đổ lòe loẹt.
- **Biểu tượng:** Không dùng icon hoạt hình/emoji rườm rà; sử dụng typography rõ nét, badge phân cấp trạng thái tinh tế.
- **Trải nghiệm:** Responsive trên cả điện thoại và máy tính, không reload trang, không dùng `alert()` trình duyệt.

---

## 4. Cấu trúc thư mục

```
codebase/
├── index.html     # Giao diện ngữ nghĩa: Đề tài ôn tập, Phòng dạy học tương tác & Dashboard
├── style.css      # Hệ màu Slate phẳng, bố cục chat stream và scorecard hiện đại
├── app.js         # Logic hội thoại 2 LLMs, bộ đếm lượt thử, phân nhánh 4 trường hợp, dashboard
└── README.md      # Tài liệu hướng dẫn luồng nghiệp vụ và cách chạy
```

---

## 5. Hướng dẫn chạy ứng dụng

Chạy lệnh sau tại thư mục gốc của repository:

```bash
python3 -m http.server 4173 --directory codebase
```

Mở trình duyệt tại:
```
http://localhost:4173
```
*(Hoặc mở trực tiếp file `codebase/index.html` trên trình duyệt).*
