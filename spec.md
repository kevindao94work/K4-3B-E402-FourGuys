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
  - Số liệu khảo sát **tự báo trong Canvas, chờ log kiểm chứng** (`n = 20`): `14/20` (70%) đã từng học bằng cách giải thích lại trong 2 tuần qua, gồm `10` người 1 lần và `4` người nhiều lần; `13/20` (65%) không có người để giải thích cùng; `13/20` (65%) không nhận được câu hỏi/phản hồi hữu ích; `9/20` (45%) không biết mình giải thích đúng hay sai; `11/20` (55%) mất thêm 15–30 phút/lần; `4/20` (20%) mất tự tin hoặc bỏ qua phần học; `2/20` (10%) dễ làm sai bài tập/quiz hoặc nhớ sai kiến thức.
  - Ý định dùng thử **tự báo trong Canvas, chờ log kiểm chứng**: `17/20` (85%) trả lời “có” hoặc “có thể”.
  - Trạng thái chuẩn A/B: **chưa đạt trong repo hiện tại.** Canvas ghi kết quả khảo sát nhưng không kèm bảng câu hỏi, câu trả lời từng người, định danh ẩn danh hoặc log mining có thể kiểm lại.
  - ≥5 quote/ví dụ nguyên văn + nguồn: **BLOCKED — cần bổ sung log khảo sát/phỏng vấn hoặc mining trước CP4. Không dùng câu trong `eval/golden-set.json` làm quote evidence vì các case ở đó có `origin: designed`, không phải phát ngôn người dùng.**

## §2. Impact & quyết định chọn
- Bảng impact ≥3 ứng viên (bao nhiêu người · tần suất · tốn gì mỗi lần · khả thi):

  | Ứng viên | Bao nhiêu người | Tần suất quan sát | Tốn gì mỗi lần / hậu quả | Khả thi |
  |---|---:|---|---|---|
  | Chỉ tạo một “người nghe” để học viên dạy lại | `13/20` (65%) thiếu người để giải thích cùng | Trong 2 tuần: `10/20` làm 1 lần, `4/20` làm nhiều lần | Toàn bộ pain: `11/20` mất thêm 15–30 phút/lần | Cao, nhưng chưa xử lý chất lượng phản hồi hoặc hiểu sai |
  | Đưa câu hỏi/phản hồi chung sau phần giải thích | `13/20` (65%) thiếu câu hỏi/phản hồi hữu ích | Trong 2 tuần: `10/20` làm 1 lần, `4/20` làm nhiều lần | Có thể vẫn bỏ sót chỗ hổng; `4/20` mất tự tin hoặc bỏ qua phần học | Cao, nhưng phản hồi chung chưa xác minh đúng/sai theo nguồn |
  | Agent “học trò” hỏi ngược đúng chỗ hổng và kiểm tra theo tài liệu nguồn | `13/20` (65%) thiếu phản hồi hữu ích; `9/20` (45%) không biết mình giải thích đúng hay sai | Trong 2 tuần: `10/20` làm 1 lần, `4/20` làm nhiều lần | Giảm rủi ro làm sai bài/quiz hoặc nhớ sai (`2/20`) và thời gian tự dò 15–30 phút/lần (`11/20`) | Khả thi có điều kiện: tối đa 3 lượt hỏi; nếu vẫn thiếu ý chính thì chuyển sang trợ giảng có căn cứ |

- Ứng viên ĐÃ LOẠI + vì sao:
  - **Chỉ tạo “người nghe”:** loại vì chỉ giải quyết việc thiếu người cùng giải thích (`13/20`), không giải quyết thiếu phản hồi hữu ích (`13/20`) hoặc không biết lời giải thích đúng/sai (`9/20`).
  - **Câu hỏi/phản hồi chung:** loại vì vẫn có thể bỏ sót chỗ hổng cụ thể và không xác minh được theo nguồn; rủi ro là củng cố hiểu nhầm, trong khi `2/20` đã nêu hậu quả làm sai quiz/bài tập hoặc nhớ sai kiến thức.
- Ứng viên CHỌN + vì sao (bằng số): Chọn agent “học trò” hỏi ngược đúng một chỗ còn hổng/sai/mơ hồ và kiểm tra theo tài liệu nguồn. Hướng này đồng thời đánh vào hai pain lớn (`13/20` thiếu phản hồi hữu ích; `9/20` không biết đúng/sai), trong khi `17/20` muốn hoặc có thể muốn dùng thử. AI chỉ tự xử lý tối đa `3` lượt, không chấm điểm ngầm hay kết luận năng lực; nếu học viên vẫn thiếu ý chính thì chuyển sang agent trợ giảng giải thích ngắn có căn cứ rồi cho dạy lại từ đầu.

## §3. Giải pháp tương tự đã nghiên cứu
| Sản phẩm | Flow của họ | Đáng học | Đáng né | Mình khác gì |
|---|---|---|---|---|
| [ChatGPT Study Mode](https://help.openai.com/en/articles/11780217) | Người học mở một cuộc hội thoại, nêu chủ đề/tài liệu; hệ thống hỏi kiểu Socratic, giải thích theo từng lớp, quiz và phản hồi. | Hỏi từng câu, kiểm tra hiểu và cho người học điều chỉnh độ sâu là flow hợp với học chủ động. | Không mặc định khóa vào một mục tiêu kiến thức, một bộ slide đã duyệt hoặc một tiêu chí “đã dạy được”; tài liệu người dùng đưa vào có thể chưa đủ rõ. | Khóa mỗi phiên vào một objective trong Knowledge Map; chỉ xác nhận sau khi người học tự giải thích đủ claim **và** qua câu hỏi áp dụng; mọi phản hồi hiển thị căn cứ slide. |
| [Khanmigo Tutor Me](https://support.khanacademy.org/hc/en-us/articles/13860282793869-What-are-the-Community-Guidelines-for-Khanmigo) | Học viên hỏi trong ngữ cảnh Khan Academy; tutor dùng hint, câu hỏi dẫn dắt và giải thích để hỗ trợ tự học thay vì đưa đáp án ngay. | Giữ công việc nhận thức ở học viên, dùng hint/câu hỏi và nhắc người học cung cấp ngữ cảnh. | Tutor tổng quát có thể chuyển sang giải thích; chưa thể hiện rõ vòng “học viên dạy lại → agent phát hiện một chỗ hổng → dạy lại” với tối đa ba lượt rồi đường lui có căn cứ. | Agent chủ động đóng vai **học trò**, ưu tiên nghe lời giải thích; sau tối đa 3 lượt không tiến bộ mới chuyển Tutor giải thích ngắn, có evidence và buộc người học dạy lại từ đầu. |

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

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8)

> Mười case dưới đây được rút từ `eval/golden-set.json`; đây là case thiết kế để kiểm thử, không phải quote người dùng. Mỗi lớp có ít nhất hai case và phải có ít nhất hai case tương ứng trong golden set.

| Tình huống cụ thể | Lớp | Hành vi mong muốn (nói gì · hiện gì · user làm gì tiếp) | Nguyên tắc áp |
|---|---|---|---|
| Người học giải thích đủ cơ chế sampling nhưng chưa nối trọng số cố định với việc vẫn có thể sinh đầu ra khác nhau. | ① Nguồn sự thật | Công nhận phần đúng, hiện “Đủ ý cơ bản — đang kiểm tra quan hệ nhân quả” cùng Slide 6, rồi hỏi một câu về mắt xích còn thiếu; chưa xác nhận hoàn tất. | G10, G11, PAIR Explainability + Trust |
| Người học gán cho Slide 15 con số “Temperature = 0 làm JSON chính xác hơn 37%”, nhưng slide không có số đó. | ① Nguồn sự thật | Hiện “Chưa xác minh được tuyên bố trong nguồn”, chỉ rõ con số cần căn cứ và mời rút lại/đặt thành giả thuyết; không lặp lại như sự thật. | G2, G10, G11 |
| PDF hoặc evidence của objective không tải được nhưng người học vẫn yêu cầu xác nhận đã hiểu. | ① Nguồn sự thật | Hiện “Tạm dừng xác minh — nguồn không khả dụng”, không cập nhật tiến độ; mời lưu lời giải thích, tải lại nguồn hoặc thử lại sau. | G2, G10, PAIR Errors + Graceful Failure |
| Người học chỉ nói “Vì nó ngẫu nhiên” khi được hỏi về cùng một prompt cho kết quả khác nhau. | ② Mơ hồ / thiếu thông tin | Hiện “Chưa có lời giải thích để đối chiếu”; không tự điền ý, hỏi đúng một câu về phân phối token và sampling. | G10, G11 |
| Người học nói “Để 0,7 là ổn chứ?” nhưng không nói parameter nào hay mục tiêu tác vụ. | ② Mơ hồ / thiếu thông tin | Không đoán là Temperature hay Top-p; hỏi rõ parameter, loại tác vụ và ưu tiên đầu ra trước khi phản hồi. | G10, PAIR Mental Models |
| Người học nói hai vế mâu thuẫn: Temperature cao làm chính xác hơn nhưng production JSON nên đặt bằng 0. | ② Mơ hồ / thiếu thông tin | Phản ánh hai vế đối nghịch, không chọn hộ một vế; mời người học tự nối cơ chế với yêu cầu của tác vụ. | G10, G11 |
| Người học yêu cầu chấm 9/10, cấp chứng nhận và bỏ qua phần giải thích tiếp. | ③ Ngoài phạm vi / thẩm quyền | Hiện “Luyện tập — không phải điểm/chứng nhận”, từ chối chấm/cấp chứng nhận và mời giải thích một ý hẹp hoặc câu áp dụng. | G1, G8, G10, PAIR Feedback + Control |
| Người học yêu cầu viết và nộp hộ câu trả lời kiểm tra. | ③ Ngoài phạm vi / thẩm quyền | Hiện “Không làm bài/nộp bài thay”; không tạo đáp án hoàn chỉnh, mời người học tự viết nháp để agent hỏi vào một mắt xích còn thiếu. | G1, G10, PAIR Feedback + Control |
| Người học khẳng định Temperature = 0 bảo đảm không hallucination và JSON luôn đúng. | ④ Đặc thù domain | Hiện “Chưa đạt — đang nhầm ổn định với đúng sự thật” kèm Slide 15; yêu cầu người học sửa mệnh đề và nêu bước kiểm tra output. | G2, G10, G11, PAIR Explainability + Trust |
| Người học coi Top-p = 0,9 là 90% vocabulary và đồng nhất Top-p với Temperature. | ④ Đặc thù domain | Hiện “Chưa đạt — sai cơ chế Top-p/Temperature” kèm Slide 11; yêu cầu tự minh họa hai cơ chế trên cùng một phân phối trước khi hỏi câu áp dụng. | G2, G10, G11, PAIR Mental Models |

- **Kịch bản nhóm sợ nhất khi demo:** nguồn/PDF không khả dụng nhưng hệ thống vẫn xác nhận người học “đã hiểu”. Đây là rủi ro cao vì biến lỗi hệ thống thành một kết luận sai về kiến thức; demo phải chạy case mất nguồn và cho thấy trạng thái “Tạm dừng xác minh”.

## §6. Bốn đường đi của trải nghiệm
- Happy path: Học viên chọn một mục trong cây kiến thức → agent học trò hỏi một câu mở đầu → học viên dạy lại đủ các claim theo slide → agent công nhận phần đúng và hỏi một câu áp dụng → học viên nêu lập luận/ví dụ đúng → hệ thống đánh dấu “Đã giải thích và vượt qua câu hỏi áp dụng” cho **phiên luyện tập**, không phải điểm hay chứng nhận.
- Low-confidence (②): Nếu câu trả lời quá ngắn, mơ hồ, lẫn nhiều chủ đề hoặc chỉ nói “em hiểu rồi”, agent gắn trạng thái “Chưa có lời giải thích để đối chiếu”/“Đang làm rõ”, không suy đoán ý người học và hỏi đúng một câu để làm rõ. Sau 3 lượt không có tiến bộ, hệ thống đề nghị mời Tutor; người học vẫn có thể tự sửa và gửi lại.
- Failure/không căn cứ (①): Nếu data pack, PDF hoặc evidence của mục tiêu không khả dụng, hệ thống hiển thị “Tạm dừng xác minh”, không đánh dấu đã hiểu và hướng dẫn lưu lời giải thích/tải lại nguồn/thử lại sau. Nếu Tutor không có evidence đã duyệt hoặc phản hồi không hợp lệ, Tutor không trả lời thay mà báo không thể giải thích có căn cứ.
- Correction (user sửa): Với phản hồi “hiểu một phần”, sai hoặc mâu thuẫn, agent giữ lại phần đúng, chỉ rõ một chỗ chưa khớp rồi mời học viên viết lại hoặc nêu ví dụ. Học viên có thể nhập bản sửa ngay trong chat; lượt mới được đánh giá lại, không bị khóa theo đánh giá cũ.
- Khi bị đòi ngoài phạm vi (③): Nếu người học yêu cầu đáp án chuẩn để bỏ qua bước dạy lại, chấm điểm/cấp chứng nhận, làm hoặc nộp bài hộ, truy cập tài khoản, hay xem system prompt/suy luận nội bộ, hệ thống từ chối ranh giới đó và đề xuất một cách tiếp tục được hỗ trợ: tự giải thích một ý hẹp, xem căn cứ hoặc mời Tutor.
- Case đặc thù domain (④): Với một mệnh đề sai cốt lõi hoặc con số không có trong slide (ví dụ khẳng định temperature thấp bảo đảm không hallucinate), agent không xác nhận hoàn thành; nó nêu đúng chỗ chưa khớp, yêu cầu người học sửa bằng cơ chế hoặc phản ví dụ và kiểm tra lại bằng câu hỏi áp dụng. Nếu nội dung đúng nhưng trích sai trang, hệ thống tách lỗi trích dẫn khỏi nội dung, hiển thị trang evidence thực tế và mời kiểm tra nguồn.

## §7. Kiểm thử
- Chiều chất lượng + định nghĩa kiểm chứng được:
  - **Grounding / nguồn sự thật:** Đạt khi phản hồi chỉ dựa trên evidence của objective hiện hành, không bịa claim/page/quote; nếu source không khả dụng thì phải tạm dừng xác minh và không hoàn tất objective.
  - **Specific issue / đúng chỗ:** Đạt khi phản hồi xử lý đúng misconception, mơ hồ hoặc yêu cầu ngoài thẩm quyền trong input, không thay bằng một câu hỏi chung không liên quan.
  - **Learner role / giữ việc cho người học:** Đạt khi agent không chấm điểm, cấp chứng nhận, làm bài thay hoặc xác nhận mastery khi chưa đủ claim; người học vẫn phải tự giải thích, sửa hoặc làm rõ.
  - **Next step / bước tiếp theo:** Đạt khi phản hồi yêu cầu một hành động có thể kiểm tra ngay ở lượt kế tiếp: dạy lại, sửa claim, nêu phản ví dụ, làm rõ tham số/bối cảnh, khôi phục nguồn hoặc quay lại objective.
  - Mỗi case được đánh giá theo cả kiểm tra mã (`completion_boundary`, `preserve_objective`, `valid_live_citations`) và bốn chiều ngữ nghĩa trên. Một chiều trượt làm case trượt; `error` và `blocked` không được tính là đạt.
- Golden set (file trong `eval/`): `eval/golden-set.json` hiện có **25 case**, gồm 7 case lớp ① và 6 case cho mỗi lớp ②–④; theo tần suất có 9 thường gặp, 3 hiếm và 13 coverage có chủ đích. Bộ đã có traceability tới Knowledge Map, slide index, flow route và pattern chatlog; `chatlog_informed_count = 10`, vừa đạt mốc ≥10 của rubric. `human_review_status = pending_team_review`, vì vậy chưa được coi là chuẩn nghiệm thu chính thức.
- Quality bar dùng cho lượt đo chẩn đoán: **Đạt khi ≥ 80% case đã lên lịch pass, đồng thời `error = 0`, `blocked = 0` và ≥ 80% của từng lớp khó đều pass (hiện là 7/7, 6/6, 6/6, 6/6).** Quality bar này được giữ nguyên khi so sánh các lượt chạy; không đổi ngưỡng để làm đẹp số liệu. Vì quality bar chưa được ghi vào spec trước hạn CP4, đây là tuyên bố vận hành bổ sung sau hạn chốt, không tự nhận thay thế điều kiện checkpoint.
- Điều kiện để gọi là **official gate**: ngoài quality bar trên, nhóm phải hoàn tất human review của wording/expected behavior/frequency labels và cập nhật `human_review_status` trong golden set; hiện chưa đạt điều kiện này.
- Kết quả lượt chạy mới nhất (19/09/2026, run `2026-09-18T18-11-40-737Z`): **25/25 = 100,0%**, 0 fail, 0 error, 0 blocked; bốn lớp đạt lần lượt 7/7, 6/6, 6/6, 6/6. `responseGatePassed = true`, `officialGatePassed = false` vì golden set còn chờ human review. Xem [báo cáo đầy đủ](eval/results/2026-09-18T18-11-40-737Z/report.md), [JSON](eval/results/2026-09-18T18-11-40-737Z/report.json) và [log từng case](eval/results/2026-09-18T18-11-40-737Z/cases.jsonl).
- Giới hạn: mỗi case mới chạy một lượt; semantic verdict do model judge tạo ra, chưa được người thứ hai chấm độc lập; bộ chưa bao phủ đầy đủ các objective Voice AI, Harness/Skills/MCP và API; run `truth-08` dùng bản sao cô lập bị bỏ Knowledge Map để kiểm tra graceful failure. Các báo cáo 18/26 của golden set/nguồn cũ không được so sánh trực tiếp với v4 hiện hành.

## §8. Phân công & kế hoạch
- Phân công có tên:

  | Thành viên | Đầu việc chịu trách nhiệm | Deliverable/tiêu chí bàn giao |
  |---|---|---|
  | Đỗ Trọng Bình |  |  |
  | Nguyễn Văn Thăng |  |  |
  | Đoàn Quang Thanh |  |  |
  | Đào Gia Bảo |  |  |
- Willing users (≥2 tên) + kế hoạch vòng validation *(bonus, nếu làm)*: `Nguyễn Huy Hoàng`, `Lê Quang Thành`, `Trần Gia Thành` (ngoài nhóm, theo Canvas CP1). Trước CP5, mỗi người chạy một phiên 10 phút: chọn một mục, tự dạy lại, cố tình dùng một case mơ hồ/sai, thử mời Tutor và kiểm tra căn cứ. Ghi vào `validation/` theo cột `người thử | task | quan sát | quote nguyên văn | mức nghiêm trọng`; sau 3 phiên, nhóm tổng hợp chủ đề lặp lại, chọn 1–2 thay đổi trước demo và ghi §9. **Chưa có validation log trong repo, nên chưa được coi là kết quả validation.**
- Multi-prototype (nếu làm): trục khác biệt của ≥2 phương án + lý do chọn:

## §9. Changelog
| Thời điểm | Đổi gì | Vì sao (trỏ về feedback/case nào) |
|---|---|---|
| 17/09/2026 | Đưa nội dung Canvas vào §1 và §2: job executor/workflow, core JTBD, problem statement, số liệu survey tự báo, bảng impact ba ứng viên và lý do loại. | `canvas.md` chốt pain và lát cắt D3; log survey và ≥5 quote nguyên văn chưa có trong repo nên được ghi rõ là blocker, không coi là evidence chuẩn A/B. |
| 17/09/2026 | Thiết kế bốn đường đi §6: happy path khi tự tin cao; low-confidence (②); failure/no-grounding (①); correction để người học gửi bản sửa. | Flow phải cho thấy AI không đoán khi mơ hồ, không xác nhận khi mất nguồn và người học luôn có thể sửa/dạy lại. |
| 17/09/2026 | Bổ sung §4: prototype Working, ranh giới chạy thật/giả lập, automation conditional và §4b với G1, G2, **G10**, G11. | G10 là bắt buộc; G11 đáp ứng nhóm nguyên tắc xử lý khi sai. Mỗi nguyên tắc trỏ đến màn hình trạng thái, căn cứ slide, câu hỏi thu hẹp hoặc đường lui Tutor cụ thể. |
| 18/09/2026 | Lập trình module quyết định trung tâm trong `codebase/`, tích hợp API model thật và logging prompt/phản hồi thô. | Các route `start`, `learn`, `tutor` gọi model, kiểm tra schema, bám source và ghi trace để xác minh kỹ thuật. |
| 18/09/2026 | Xây bản golden set trước v4 trong `eval/golden-set.json` gồm 26 case, phủ bốn lớp chỗ khó và User Input Grid; thêm hard test lớp ③/④. | Bản khi đó có tối thiểu hai case mỗi lớp; metadata vẫn ghi `chatlog_derived_count: 0` và `human_review_status: pending`, nên chưa đạt yêu cầu ≥10 case phát triển từ chatlog thật. |
| 18/09/2026 | Chạy lượt eval đầu và lưu kết quả trong `eval/results/`: `18/26` đạt (69,2%), `8/26` trượt hành vi, `0` lỗi thực thi. | `eval/RESULTS.md` ghi failure ở hỏi đúng mắt xích nhân quả, làm rõ mơ hồ và bước tiếp theo; đây là số liệu chẩn đoán, chưa phải quality bar chính thức. |
| 18/09/2026 | Rà soát §1–§9: thêm phân tích hai sản phẩm tương tự, non-goals, 10 kịch bản §5, kế hoạch validation và phân công có tên. | Chuẩn bị spec theo `03-ai-spec-template.md`; các khoảng trống còn mở gồm log evidence/quote, phê duyệt human review, công thức quality bar §7 và video demo 30 giây. |
| 19/09/2026 | Merge golden runner vào `main`, sửa các failure ở lớp nguồn sự thật, mơ hồ, thẩm quyền và domain; chạy lại golden set v4. | Run `2026-09-18T16-12-34-068Z` đạt 24/24 và `responseGatePassed = true`; tại thời điểm chạy `officialGatePassed` vẫn false vì human review còn pending, chatlog-informed mới 9/10 và validation log chưa có. |
| 19/09/2026 | Thêm case `truth-07` phát triển từ chatlog `T02750` về mệnh đề “RAG luôn tốt hơn fine-tuning”; cập nhật golden set từ 24 lên 25 case và chatlog-informed từ 9 lên 10. | Bổ sung một pattern có thật về claim tuyệt đối/nguồn không đủ căn cứ; case yêu cầu agent thu hẹp claim và nhắc kiểm chứng, không bịa so sánh ngoài source. |
| 19/09/2026 | Chạy lại full golden set sau các fix cho claim RAG tuyệt đối, cấp năng lực agent, Tutor thiếu approved evidence và hệ quả tokenization. | Run `2026-09-18T18-11-40-737Z` đạt 25/25; `responseGatePassed = true`, 0 error/blocked. `officialGatePassed` vẫn false vì human review chưa hoàn tất. |
