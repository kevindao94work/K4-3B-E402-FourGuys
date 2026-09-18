# Template AI Spec *(spec.md — commit trước hạn chốt spec: 21:00 18/9, tại CP4 · quality bar chốt từ thời điểm nộp)*

> Cấu trúc phủ đúng "SPEC 8 phần" của chương trình: Bằng chứng (§1-§2) · Lát cắt (§4) · Canvas (đính kèm CP1) · Augment/Automate (§4) · 4 đường đi của trải nghiệm (§6) · Kiểu lỗi (§5) · Kiểm thử (§7) · Phân công (§8). Hướng dẫn viết từng mục: `02-guide.md`.

# AI SPEC — Dạy lại để hiểu : Agent học trò hỏi ngược · Nhóm: FourGuys · Zone: B
Hướng: [ ] A — VLearn  [ ] B — Trợ lý Học viên [X] — Học tập thích ứng & tương tác trên VLearn  [ ] E — Làn mở

Loại: [ ] Tối ưu tính năng có sẵn  [X] Tính năng mới

## §1. User & Job
- Bối cảnh: Track D · D3 — Học bằng cách dạy.
- Job executor + workflow (đính kèm worksheet JTBD / ảnh sơ đồ): Học viên vừa học xong một bài trên VLearn, đang ở màn hình ôn tập sau buổi học và cố gắng tự kiểm tra xem mình thật sự hiểu khái niệm vừa học hay chỉ nhớ lơ mơ.
- Core JTBD (không tên sản phẩm/AI trong câu): Khi vừa học xong một khái niệm, tôi muốn dạy lại khái niệm đó và được hỏi ngược đúng chỗ còn hổng, sai hoặc mơ hồ, để biết mình đã thật sự hiểu và có thể giải thích, nêu ví dụ đúng.
- Problem statement (KHÔNG chữ AI): Khi tự ôn lại bài, học viên cố giải thích lại để kiểm tra mức hiểu nhưng thiếu người nghe và thiếu phản hồi đúng chỗ hổng, nên phải tự dò slide hoặc Internet, mất thêm thời gian và vẫn có nguy cơ nhớ sai hoặc bỏ qua phần chưa vững.
- Evidence (chuẩn A và/hoặc B — log đầy đủ trong repo):
  - Số liệu mining / kết quả khảo sát (`n = 20`): `14/20` (70%) đã từng học bằng cách giải thích lại trong 2 tuần qua, gồm `10` người 1 lần và `4` người nhiều lần; `13/20` (65%) không có người để giải thích cùng; `13/20` (65%) không nhận được câu hỏi/phản hồi hữu ích; `9/20` (45%) không biết mình giải thích đúng hay sai; `11/20` (55%) mất thêm 15–30 phút/lần; `4/20` (20%) mất tự tin hoặc bỏ qua phần học; `2/20` (10%) dễ làm sai bài tập/quiz hoặc nhớ sai kiến thức.
  - Ý định dùng thử: `17/20` (85%) trả lời “có” hoặc “có thể”.
  - ≥5 quote/ví dụ nguyên văn + nguồn: **TODO — Canvas chưa cung cấp quote nguyên văn và nguồn tương ứng; cần bổ sung từ log khảo sát/phỏng vấn.**

## §2. Impact & quyết định chọn
- Bảng impact ≥3 ứng viên (bao nhiêu người · tần suất · tốn gì mỗi lần · khả thi):

  | Ứng viên | Bao nhiêu người | Tần suất quan sát | Tốn gì mỗi lần / hậu quả | Khả thi |
  |---|---:|---|---|---|
  | Chỉ tạo một “người nghe” để học viên dạy lại | `13/20` (65%) thiếu người để giải thích cùng | Trong 2 tuần: `10/20` làm 1 lần, `4/20` làm nhiều lần | Toàn bộ pain: `11/20` mất thêm 15–30 phút/lần | Cao, nhưng chưa xử lý chất lượng phản hồi hoặc hiểu sai |
  | Đưa câu hỏi/phản hồi chung sau phần giải thích | `13/20` (65%) thiếu câu hỏi/phản hồi hữu ích | Trong 2 tuần: `10/20` làm 1 lần, `4/20` làm nhiều lần | Có thể vẫn bỏ sót chỗ hổng; `4/20` mất tự tin hoặc bỏ qua phần học | Cao, nhưng phản hồi chung chưa xác minh đúng/sai theo nguồn |
  | Agent “học trò” hỏi ngược đúng chỗ hổng và kiểm tra theo tài liệu nguồn | `13/20` (65%) thiếu phản hồi hữu ích; `9/20` (45%) không biết mình giải thích đúng hay sai | Trong 2 tuần: `10/20` làm 1 lần, `4/20` làm nhiều lần | Giảm rủi ro làm sai bài/quiz hoặc nhớ sai (`2/20`) và thời gian tự dò 15–30 phút/lần (`11/20`) | Khả thi có điều kiện: tối đa 3 lượt hỏi; nếu vẫn thiếu ý chính thì chuyển sang trợ giảng có căn cứ |

- Ứng viên ĐÃ LOẠI + vì sao: Loại phương án chỉ tạo “người nghe” vì không giải quyết nhu cầu nhận phản hồi (`13/20`); loại phản hồi chung vì chưa giải quyết việc không biết đúng hay sai (`9/20`) và có thể củng cố hiểu nhầm.
- Ứng viên CHỌN + vì sao (bằng số): Chọn agent “học trò” hỏi ngược đúng một chỗ còn hổng/sai/mơ hồ và kiểm tra theo tài liệu nguồn. Hướng này đồng thời đánh vào hai pain lớn (`13/20` thiếu phản hồi hữu ích; `9/20` không biết đúng/sai), trong khi `17/20` muốn hoặc có thể muốn dùng thử. AI chỉ tự xử lý tối đa `3` lượt, không chấm điểm ngầm hay kết luận năng lực; nếu học viên vẫn thiếu ý chính thì chuyển sang agent trợ giảng giải thích ngắn có căn cứ rồi cho dạy lại từ đầu.

## §3. Giải pháp tương tự đã nghiên cứu
- [Sản phẩm 1]: flow / đáng học / đáng né / mình khác gì
- [Sản phẩm 2]: ...

## §4. Thiết kế
- Lát cắt MỘT CÂU (1 user · 1 việc · 1 quyết định AI · 1 kết quả):
- Non-goals (≥3 thứ KHÔNG build):
- Mức prototype nhắm tới: [ ] Sketch [ ] Mock [ ] Working — phần nào mock, phần nào thật:
- Automation: [ ] augment [ ] conditional [ ] automate — lý do theo cost-of-error:
- §4b. Nguyên tắc đã áp dụng (≥4 — HAX/PAIR, xem guide):
  | Nguyên tắc | Áp cụ thể vào đâu trong prototype |
  |---|---|

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8) [bảng theo guide §2.5]

## §6. Bốn đường đi của trải nghiệm
- Happy path: · Low-confidence (②): · Failure/không căn cứ (①): · Correction (user sửa):
- Khi bị đòi ngoài phạm vi (③): · Case đặc thù domain (④):

## §7. Kiểm thử
- Chiều chất lượng + định nghĩa kiểm chứng được:
- Golden set (≥20 case theo cơ cấu trong guide §2.6, file trong eval/):
- Quality bar (chốt từ hạn chốt spec của khoá, giữ nguyên sau đó): "Đạt khi ≥ ___% qua bộ, và ___"
- Kết quả các lượt chạy (bảng % — cập nhật đến trước CP6):

## §8. Phân công & kế hoạch
- Phân công có tên: spec / evidence / prompt / code / demo
- Willing users (≥2 tên) + kế hoạch vòng validation *(bonus, nếu làm)*:
- Multi-prototype (nếu làm): trục khác biệt của ≥2 phương án + lý do chọn:

## §9. Changelog
| Thời điểm | Đổi gì | Vì sao (trỏ về feedback/case nào) |
