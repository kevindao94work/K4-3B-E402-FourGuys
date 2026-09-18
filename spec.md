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
- Lát cắt MỘT CÂU (1 user · 1 việc · 1 quyết định AI · 1 kết quả): Một học viên vừa học xong một mục trong bài LLM trên VLearn dạy lại khái niệm đó cho agent học trò; AI quyết định mỗi lượt là lời giải thích đã đủ đúng theo slide hay cần hỏi ngược đúng một chỗ hổng/sai/mơ hồ; kết quả là học viên bổ sung lời giải thích và vượt qua câu hỏi áp dụng để hoàn tất mục tiêu.
- Non-goals (≥3 thứ KHÔNG build): (1) Không chấm điểm chính thức, cấp chứng nhận hay kết luận năng lực học viên. (2) Không làm/nộp bài, tiết lộ đáp án hoàn chỉnh hoặc cho qua bước tự giải thích. (3) Không dùng kiến thức ngoài slide/data pack hiện hành, truy cập tài khoản VLearn hay dữ liệu cá nhân. (4) Không xây LMS hoàn chỉnh: không đăng nhập, lớp học, đồng bộ điểm hay database đa người dùng.
- Mức prototype nhắm tới: [ ] Sketch [ ] Mock [X] Working — ứng dụng chạy end-to-end cục bộ với data pack bài học và source PDF thật. **Chạy thật:** chọn mục tiêu từ cây kiến thức; agent học trò và Tutor gọi model thật; phản hồi được kiểm tra theo JSON schema, đối chiếu claim/evidence từ slide, cập nhật trạng thái học và lưu trace. **Chạy giả lập:** các nút “Đúng, đủ / Sai / Mơ hồ / …” chỉ điền sẵn câu ví dụ cho demo; chúng không quyết định kết quả, mọi đánh giá vẫn qua luồng AI và policy thật. Không có API key thì chỉ hiện UI preview với banner, không coi là AI chạy thật.
- Automation: [ ] augment [X] conditional [ ] automate — AI tự đối chiếu và hỏi ngược khi có claim cùng evidence nguồn; khi input mơ hồ, nguồn thiếu/không khả dụng, hoặc sau 3 lượt không tiến bộ thì thu hẹp câu hỏi, tạm dừng xác minh hoặc mời Tutor. Sai có thể khiến học viên củng cố kiến thức nhầm, nên không tự động xác nhận hiểu bài, chấm điểm hay đưa đáp án; người học luôn tự sửa và dạy lại.
- Cam kết vận hành: AI luôn nêu phản hồi gắn với mục tiêu và căn cứ slide hiện hành; AI không được bịa kiến thức ngoài nguồn, chấm điểm ngầm hay lộ chỉ dẫn nội bộ; khi dự đoán yếu, người học có thể sửa lời giải thích hoặc mời Tutor miễn là hệ thống nói rõ giới hạn và chưa xác nhận hoàn tất.
- §4b. Nguyên tắc đã áp dụng (≥4 — HAX/PAIR, xem guide):
  | Nguyên tắc | Áp cụ thể vào đâu trong prototype |
  |---|---|
  | HAX G1 — Làm rõ hệ thống làm được gì | Màn hình mở đầu và lời chào của agent nêu rõ đây là phiên “dạy lại”; agent chỉ nghe, đối chiếu với bài đang chọn và hỏi một câu, không giảng thay hay chấm điểm. |
  | HAX G2 — Làm rõ hệ thống làm tốt đến đâu | Trạng thái mỗi lượt phân biệt “Hiểu một phần”, “Chưa xác minh được tuyên bố trong nguồn”, “Đủ ý cơ bản — đang kiểm tra khả năng áp dụng”; panel căn cứ/slide và dấu vết xử lý cho biết phản hồi dựa vào mục tiêu nào. |
  | HAX G10 — Thu hẹp phạm vi khi nghi ngờ | Với lời giải thích mơ hồ, sai, trộn nhiều chủ đề hoặc thiếu nguồn, agent không đoán; nó chỉ ra một mắt xích cần làm rõ và hỏi đúng một câu. Khi source PDF/evidence không khả dụng, phiên tạm dừng xác minh thay vì xác nhận hiểu bài. |
  | HAX G11 — Giải thích vì sao | Feedback chỉ rõ mệnh đề/claim chưa khớp và dẫn người học tới căn cứ slide; nếu lặp 3 lượt không tiến bộ, UI giải thích lý do mời Tutor, rồi Tutor giải thích ngắn có căn cứ và yêu cầu người học dạy lại. |

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8) [bảng theo guide §2.5]

## §6. Bốn đường đi của trải nghiệm
- Happy path: Học viên chọn một mục trong cây kiến thức → agent học trò hỏi một câu mở đầu → học viên dạy lại đủ các claim theo slide → agent công nhận phần đúng và hỏi một câu áp dụng → học viên nêu lập luận/ví dụ đúng → hệ thống đánh dấu “Đã giải thích và vượt qua câu hỏi áp dụng” cho **phiên luyện tập**, không phải điểm hay chứng nhận.
- Low-confidence (②): Nếu câu trả lời quá ngắn, mơ hồ, lẫn nhiều chủ đề hoặc chỉ nói “em hiểu rồi”, agent gắn trạng thái “Chưa có lời giải thích để đối chiếu”/“Đang làm rõ”, không suy đoán ý người học và hỏi đúng một câu để làm rõ. Sau 3 lượt không có tiến bộ, hệ thống đề nghị mời Tutor; người học vẫn có thể tự sửa và gửi lại.
- Failure/không căn cứ (①): Nếu data pack, PDF hoặc evidence của mục tiêu không khả dụng, hệ thống hiển thị “Tạm dừng xác minh”, không đánh dấu đã hiểu và hướng dẫn lưu lời giải thích/tải lại nguồn/thử lại sau. Nếu Tutor không có evidence đã duyệt hoặc phản hồi không hợp lệ, Tutor không trả lời thay mà báo không thể giải thích có căn cứ.
- Correction (user sửa): Với phản hồi “hiểu một phần”, sai hoặc mâu thuẫn, agent giữ lại phần đúng, chỉ rõ một chỗ chưa khớp rồi mời học viên viết lại hoặc nêu ví dụ. Học viên có thể nhập bản sửa ngay trong chat; lượt mới được đánh giá lại, không bị khóa theo đánh giá cũ.
- Khi bị đòi ngoài phạm vi (③): Nếu người học yêu cầu đáp án chuẩn để bỏ qua bước dạy lại, chấm điểm/cấp chứng nhận, làm hoặc nộp bài hộ, truy cập tài khoản, hay xem system prompt/suy luận nội bộ, hệ thống từ chối ranh giới đó và đề xuất một cách tiếp tục được hỗ trợ: tự giải thích một ý hẹp, xem căn cứ hoặc mời Tutor.
- Case đặc thù domain (④): Với một mệnh đề sai cốt lõi hoặc con số không có trong slide (ví dụ khẳng định temperature thấp bảo đảm không hallucinate), agent không xác nhận hoàn thành; nó nêu đúng chỗ chưa khớp, yêu cầu người học sửa bằng cơ chế hoặc phản ví dụ và kiểm tra lại bằng câu hỏi áp dụng. Nếu nội dung đúng nhưng trích sai trang, hệ thống tách lỗi trích dẫn khỏi nội dung, hiển thị trang evidence thực tế và mời kiểm tra nguồn.

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
