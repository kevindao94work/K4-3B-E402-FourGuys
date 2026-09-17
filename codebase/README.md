# ExplainLab — Prototype Giao Diện CP2 (Lab AI20k)

> **Track D3: Học bằng cách dạy (Learning by Teaching)**  
> Giai đoạn: **CheckPoint 2 (CP2)** — Chứng minh luồng trải nghiệm (End-to-End User Flow).  
> **Lưu ý quan trọng:** Toàn bộ phản hồi trong phiên bản này là **dữ liệu mock cố định**, phục vụ kiểm thử tương tác và demo giao diện, chưa kết nối backend và không sử dụng API key.

---

## 1. Giới thiệu sản phẩm

**ExplainLab** là công cụ hỗ trợ người học ôn tập khái niệm bằng phương pháp *học bằng cách dạy*:
- Người học tự diễn giải lại kiến thức bằng lời văn của chính mình như đang giảng bài cho một người mới.
- Hệ thống lắng nghe, phân tích và phản hồi:
  1. **Bạn đã làm tốt:** Ghi nhận những điểm đúng đã diễn giải được.
  2. **Có thể bổ sung:** Chỉ ra cụ thể các lỗ hổng kiến thức hoặc phần giải thích còn mơ hồ.
  3. **Câu hỏi để bạn tự sửa:** Đưa ra câu hỏi gợi mở để người học tự tư duy và bổ sung lại bài giảng.

---

## 2. Phong cách thiết kế giao diện (UI Theme)

- **Phong cách:** Clean Slate Minimalist (lấy cảm hứng từ hệ thống thiết kế Shadcn UI & Linear).
- **Màu sắc:** 100% màu phẳng (flat colors), không sử dụng gradient. Sử dụng hệ màu Slate trung tính (`#0f172a`, `#475569`, `#f8fafc`) kết hợp các trạng thái cảnh báo và thành công nhẹ nhàng (subtle borders & backgrounds).
- **Typography & Biểu tượng:** Tối giản biểu tượng thừa, tập trung vào tính rõ ràng, độ tương phản cao, phù hợp với môi trường giáo dục và doanh nghiệp nghiêm túc.

---

## 3. Luồng trải nghiệm (End-to-End Flow)

Ứng dụng chạy mượt mà trên cùng một trang (Single Page Interactive Flow, không cần router):

```
[Màn hình 1: Chọn chủ đề]
      │
      ▼ (Bấm "Bắt đầu giải thích →")
[Màn hình 2: Viết phần giải thích]
      │
      ▼ (Kiểm tra nhập liệu & Bấm "Gửi phần giải thích")
[Màn hình 3: Phản hồi & Đánh giá]
      │
      ├── (Bấm "Sửa phần giải thích") ──> Quay lại Màn hình 2 (giữ nguyên bài cũ)
      └── (Bấm "Đổi chủ đề") ─────────> Quay lại Màn hình 1 (chọn lại)
```

1. **Màn hình 1 — Chọn chủ đề:**
   - Tiêu đề: *“Học bằng cách giải thích lại”*.
   - Mô tả ngắn: *“Hãy thử dạy lại một khái niệm bằng lời của bạn để phát hiện phần mình chưa hiểu.”*
   - 3 chủ đề mẫu: **ReAct**, **Prompt Engineering**, **RAG**.
   - Nút `Bắt đầu giải thích →` chuyển sang Màn hình 2.

2. **Màn hình 2 — Viết phần giải thích:**
   - Hiển thị chủ đề đang chọn kèm câu hướng dẫn: *“Hãy giải thích khái niệm này như đang dạy cho một người mới học.”*
   - Ô nhập văn bản rộng rãi, bộ đếm ký tự thời gian thực.
   - Gợi ý mở đầu: *“Khái niệm này dùng để…”* kèm nút chèn nhanh gợi ý.
   - Hỗ trợ demo nhanh: Điền đoạn văn bản mẫu hoặc xóa trắng.
   - **Xử lý lỗi thân thiện:** Nếu bấm gửi khi ô nhập rỗng, hệ thống hiển thị thông báo lỗi inline trong giao diện (không dùng popup `alert()` của trình duyệt).
   - Nút `Gửi phần giải thích` chuyển sang Màn hình 3.

3. **Màn hình 3 — Phản hồi & Đánh giá:**
   - Hiển thị điểm số dạng số thực tế (ví dụ: `72 / 100`).
   - Badge trạng thái trực quan: `Còn một vài lỗ hổng — hãy thử giải thích lại`.
   - Ba khu vực cốt lõi:
     - **Bạn đã làm tốt:** 2 ý đúng cụ thể.
     - **Có thể bổ sung:** 2 lỗ hổng kiến thức cần lấp đầy.
     - **Câu hỏi để bạn tự sửa:** Câu hỏi mở kích thích tư duy.
   - Khung xem lại bài giải thích đã gửi.
   - Nút `Sửa phần giải thích`: Quay lại màn hình 2 và giữ nguyên nội dung cũ để tiếp tục hoàn thiện.
   - Nút `Đổi chủ đề`: Quay lại màn hình 1.

---

## 4. Bộ chọn kịch bản Demo (Demo Scenario Switcher)

Tại góc trên bên phải thanh điều hướng, người kiểm thử có thể chuyển đổi giữa **3 tình huống demo**:

| Tình huống | Điểm số | Trạng thái hiển thị | Mục đích kiểm thử |
|---|:---:|---|---|
| **Có lỗ hổng kiến thức** *(mặc định)* | `72 / 100` | *Còn một vài lỗ hổng — hãy thử giải thích lại* | Đánh giá phản hồi chỉ ra 2 ý đúng, 2 lỗ hổng và 1 câu hỏi dẫn dắt người học tự sửa. |
| **Phản hồi tích cực** | `92 - 96 / 100` | *Giải thích rất tốt — Đầy đủ & rõ ràng* | Xác nhận học viên đã giải thích khá đầy đủ, gợi ý mở rộng thêm kỹ năng nâng cao. |
| **Không đủ thông tin** | `30 - 35 / 100` | *Chưa đủ thông tin — Cần bổ sung chi tiết* | Thông báo "Chưa thể đánh giá chắc chắn", yêu cầu bổ sung định nghĩa hoặc ví dụ cụ thể. |

---

## 5. Cấu trúc thư mục

```
codebase/
├── index.html     # Cấu trúc giao diện HTML5 ngữ nghĩa, gồm 3 màn hình và thanh tiến trình
├── style.css      # Toàn bộ định dạng giao diện, phong cách Clean Slate phẳng, responsive
├── app.js         # Logic điều hướng bước, quản lý dữ liệu mock, validation và tương tác
└── README.md      # Tài liệu hướng dẫn sử dụng và kiểm thử prototype
```

- **Công nghệ sử dụng:** HTML5, CSS3, Pure JavaScript (ES6+).
- **Không có phụ thuộc (Zero-dependency):** Không cần cài đặt `npm`, `node_modules` hay bất kỳ thư viện bên thứ ba nào.

---

## 6. Hướng dẫn chạy ứng dụng

### Chạy bằng Python (Khuyến nghị)
Mở terminal tại thư mục gốc của repository và chạy lệnh:

```bash
python3 -m http.server 4173 --directory codebase
```

Sau đó mở trình duyệt và truy cập:
```
http://localhost:4173
```

*(Hoặc mở trực tiếp file `codebase/index.html` bằng bất kỳ trình duyệt hiện đại nào).*
