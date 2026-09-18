# Thiết kế module học bằng cách giảng lại

## 1. Mục tiêu

Người dùng học một phần bài giảng bằng cách **tự giải thích lại cho Agent học viên**. Hệ thống chỉ kết luận người dùng đã đạt khi họ giải thích đúng, đủ các ý bắt buộc và xử lý được một câu hỏi áp dụng. Nếu người dùng mắc kẹt, **Agent Tutor** giải thích ngắn; sau đó quyền nói lại quay về người dùng.

Đây là một module hẹp cho hackathon, không phải hệ thống LMS hoàn chỉnh.

## 2. Quyết định thiết kế đã chốt

Có hai agent hiển thị trong trải nghiệm:

1. **Agent học viên**: người dùng đang "dạy" agent này.
2. **Agent Tutor**: chỉ xuất hiện khi người dùng chủ động cần giải thích hoặc đã mắc kẹt.

Hai agent có thể dùng cùng model, cùng Knowledge Map và cùng cơ chế truy xuất source bundle slide. Chúng khác ở chính sách hành động:

| Tiêu chí | Agent học viên | Agent Tutor |
|---|---|---|
| Mục tiêu | Khai thác và kiểm tra mức hiểu của user | Gỡ đúng một điểm user đang kẹt |
| Có đánh giá câu trả lời? | Có, chạy ngầm để chọn câu hỏi tiếp | Không phải nhiệm vụ chính |
| Có đặt câu hỏi? | Có; đây là hành động chính | Có thể hỏi ở cuối để yêu cầu user giảng lại |
| Có đưa gợi ý/đáp án? | **Không** | Có, ngắn và bám bài giảng |
| Khi được gọi | Sau mỗi lượt user hoặc khi user lạc đề | Khi user yêu cầu trợ giúp hoặc vượt ngưỡng mắc kẹt |

Không cần một Evaluator agent độc lập trong MVP. Năng lực đánh giá là phần nội bộ, có output JSON, của Agent học viên. Không hiển thị JSON này cho user.

## 3. Nguyên tắc sư phạm cốt lõi

- User là người dạy; agent học viên không giảng bài thay user.
- Sai lần đầu là cơ hội để user tự phát hiện sai, không phải lý do gọi Tutor ngay.
- Agent học viên **chỉ hỏi**, kể cả khi nó biết user đang sai. Nó không đưa từ khóa, gợi ý, nguồn slide hay lời giải từng phần.
- Với một lỗi, agent hỏi bằng cách đặt ra mâu thuẫn/điều kiện phản ví dụ để user tự xem lại lập luận.
- Tutor là vai trò duy nhất được phép giải thích hoặc đưa ví dụ.
- Sau Tutor, user phải tự giảng lại; không được kết thúc phiên chỉ vì Tutor đã nói đáp án.
- Mọi nhận xét kiến thức phải bám Knowledge Map và evidence được truy xuất từ bài giảng, không dựa tự do vào kiến thức nền của model.

## 4. Knowledge Map: chuẩn để đánh giá

Knowledge Map không được sinh mới mỗi khi user bấm "Luyện tập". Đây là file cấu hình kiến thức đã được nhóm chốt trước runtime cho từng **learning unit** (một khái niệm/kỹ năng có thể luyện trong 5--7 phút). Nó có thể được LLM hỗ trợ tạo nháp, nhưng phải được nhóm kiểm tra lại với học liệu trước khi dùng để đánh giá user.

Mỗi phiên MVP chỉ chọn một learning unit nhỏ, có 2--3 mục tiêu học tập. Mỗi mục tiêu có các ý bắt buộc, lỗi sai phổ biến và mã nguồn bài giảng.

```json
{
  "lesson_id": "attention-basics",
  "objectives": [
    {
      "id": "attention-purpose",
      "required_claims": [
        "Attention phân bổ mức liên quan cho thông tin đầu vào",
        "Không chỉ chọn đúng một token rồi bỏ phần còn lại"
      ],
      "common_misconceptions": [
        "Attention chỉ lấy một từ quan trọng nhất"
      ],
      "source_ids": ["d1-p012"]
    },
    {
      "id": "qkv-relationship",
      "required_claims": [
        "Query và Key được dùng để tính độ liên quan",
        "Value được tổng hợp theo các trọng số đó"
      ],
      "source_ids": ["d1-p013"]
    }
  ],
  "dependencies": [["attention-purpose", "qkv-relationship"]]
}
```

Ví dụ trên chỉ minh họa schema; `d1-p012` là mã trang PDF nội bộ, không khẳng định nội dung thật của trang đó. Knowledge Map là chuẩn đánh giá; source bundle dùng để lấy đúng phần học liệu đã gắn `source_ids` và làm căn cứ cho đánh giá hoặc giải thích.

### 4.1 Vai trò của từng nguồn học liệu

| Nguồn | Vai trò trong hệ thống | Không dùng để làm gì |
|---|---|---|
| Key takeaway trên web | Xác định mục tiêu học tập và các ý tối thiểu cần hiểu | Không tự đủ để Tutor giải thích sâu mọi trường hợp |
| PDF slide | **Nguồn sự thật duy nhất của MVP**: thuật ngữ, sơ đồ, lập luận và bằng chứng để đánh giá/giải thích | Không phải lúc nào cũng đủ ngữ cảnh/lý do |
| Transcript video | Ngoài phạm vi MVP hiện tại; có thể bổ sung ở phiên bản sau để tăng ví dụ/ngữ cảnh | Không dùng để tạo claim hay evidence cho bản demo |
| Chatlog tutor | Tìm lỗi lặp lại và tạo golden set từ tình huống thật | **Không** là nguồn sự thật của bài giảng |

Thứ tự ưu tiên trong MVP là: key takeaway đã được nhóm chốt scope -> PDF slide. Nếu key takeaway và slide mâu thuẫn hoặc slide không đủ evidence, nhóm phải sửa/giảm scope Knowledge Map; model không được tự suy đoán.

### 4.2 Cách tạo map cho MVP

1. Chọn một cụm 3--5 slide liên tiếp, hoặc một card key takeaway rõ ràng; không làm toàn bộ bài học.
2. Gắn key takeaway đó với các trang PDF tương ứng.
3. Dùng key takeaway làm nháp cho `objectives` và `required_claims`.
4. Đính evidence cho từng claim từ slide; nhóm đọc lại và bỏ mọi claim không được nguồn hỗ trợ.
5. Lưu JSON đã chốt theo `unit_id`; runtime chỉ tải JSON này, không sinh lại map.

Một card key takeaway có thể trở thành một objective, nhưng card quá dày nên được chia nhỏ. Ví dụ card "Liên hệ AI, ML, DL, generative AI và LLM" có nhiều quan hệ phân cấp, phù hợp để tách thành hai objective thay vì bắt user giải thích cả card trong một lượt.

### 4.3 Evidence có kiểu nguồn

Trong implementation, `source_ids` nên được lưu dưới dạng evidence có kiểu thay vì chỉ là chuỗi ID đơn lẻ. Ví dụ:

```json
{
  "id": "agent-loop",
  "required_claims": [
    {
      "text": "Agent quan sát kết quả hành động và cập nhật trạng thái trước vòng lặp tiếp theo.",
      "evidence": [
        { "type": "key_takeaway", "id": "agent-foundation-card-01" },
        { "type": "slide", "id": "d1-p012", "pdf_page": 12 }
      ]
    }
  ]
}
```

Ở UI, Agent học viên không cần hiện evidence cho user khi đang hỏi. Evidence phải có trong output nội bộ/log để kiểm tra grounding; Tutor có thể gắn nút "Xem phần bài học liên quan" nếu UX cho phép.

### 4.4 Ingest PDF và sinh slide evidence

PDF không được đưa nguyên khối vào prompt. Trước runtime, tách nó thành index theo từng trang/slide. Mỗi record tối thiểu gồm `slide_id`, tên PDF, `pdf_page`, số slide hiển thị (nếu có), tiêu đề và text trích xuất.

```md
# [d1-p012]

source_pdf: d1-slide-hackathon.pdf
pdf_page: 12
displayed_slide_number: 8
title: Vòng lặp hoạt động của Agent

text:
- Goal
- Reasoning
- Tool
- Action
- Memory
```

Với slide có sơ đồ/ảnh chứa kiến thức, render trang thành ảnh và tạo `visual_summary` bằng model vision. Evidence dựa trên sơ đồ phải được gắn `review_status: "needs_review"`, vì mô tả ảnh có rủi ro sai cao hơn text extract.

Để tạo evidence mà không cần user nhập tay:

1. Dùng key takeaway làm query, tìm 3--5 slide candidate trong PDF index. Với scope đóng, nhóm chọn sẵn candidate; scope mở mới cần retrieval text/embedding.
2. Đưa key takeaway và **chỉ** các candidate này vào LLM.
3. Yêu cầu LLM sinh objective, required claim, `slide_id`, và `supporting_quote` ngắn lấy nguyên văn từ slide.
4. Validator kiểm tra `slide_id` thuộc candidate và `supporting_quote` có xuất hiện trong text extract của slide. Không hợp lệ thì loại evidence/đánh dấu cần review.
5. Team review nhanh 4--6 claim/evidence của learning unit demo rồi đặt `review_status: "approved"`.

Schema evidence nên có thêm quote và trạng thái review:

```json
{
  "type": "slide",
  "slide_id": "d1-p012",
  "pdf_page": 12,
  "supporting_quote": "Goal → Reasoning → Tool → Action → Memory",
  "evidence_type": "text",
  "review_status": "auto_generated"
}
```

Không nên để LLM tự nói "ý này ở slide 12" mà không có `supporting_quote` được validator kiểm tra. Với CP3, review ít evidence của đúng unit demo đáng tin hơn nhiều so với tự động hóa toàn bộ PDF.

## 5. Luồng một phiên học

```text
Chọn chủ đề nhỏ
        |
        v
User giảng bài cho Agent học viên
        |
        v
Agent học viên truy xuất nguồn + đánh giá nội bộ
        |
        +-- Đúng nhưng thiếu ------> hỏi tiếp đúng phần thiếu
        |
        +-- Sai lần đầu ----------> hỏi phản biện tạo mâu thuẫn
        |
        +-- Lặp lỗi / user kẹt ---> gọi Agent Tutor
        |                                  |
        |                                  v
        |                         Tutor giải thích ngắn
        |                                  |
        +<---------------------------------+
        |
        v
User giảng lại --> kiểm tra câu hỏi áp dụng --> hoàn thành
```

## 6. Agent học viên: đánh giá ngầm và chỉ đặt câu hỏi

### 6.1 Input

- Câu trả lời mới nhất của user.
- Lịch sử hội thoại rút gọn.
- Mục tiêu học tập hiện tại và trạng thái các mục tiêu trước đó.
- Knowledge Map của chủ đề đang học.
- Source bundle của các slide liên quan.
- Session state: số lần thử, lỗi lặp lại, trạng thái đã dùng Tutor hay chưa.

### 6.2 Output nội bộ bắt buộc

```json
{
  "intent": "answer_question",
  "relevance": "relevant",
  "assessment": "incorrect",
  "covered_objectives": ["attention-purpose"],
  "missing_claims": ["Value được tổng hợp theo trọng số attention"],
  "misconception": {
    "id": "attention-picks-one-token",
    "severity": "core",
    "source_ids": ["d1-p012"]
  },
  "next_action": "ask_counterfactual_question",
  "question_target": "attention-purpose",
  "confidence": 0.89
}
```

`visible_message` cũng được sinh trong cùng lượt gọi, nhưng chỉ được phép là một câu hỏi theo đúng `next_action`. App chỉ hiển thị phần này cho user.

### 6.3 Các dạng câu hỏi được phép

| Tình trạng | Dạng câu hỏi | Ví dụ |
|---|---|---|
| Đúng nhưng thiếu | Làm rõ phần thiếu | “Bạn vừa nói về Query. Vậy Value được dùng ở bước nào trong quy trình này?” |
| Sai lần đầu | Câu hỏi mâu thuẫn/phản ví dụ | “Nếu attention chỉ chọn một từ, các từ liên quan ở mức khác nhau sẽ được xử lý thế nào?” |
| Lẫn lộn hai khái niệm | Buộc phân biệt vai trò | “Trong lời giải thích của bạn, Query và Key đang làm cùng một việc hay hai việc khác nhau? Vì sao?” |
| Nói thuộc định nghĩa | Hỏi cơ chế ‘vì sao/như thế nào’ | “Tại sao cần tính mức liên quan trước khi tổng hợp Value?” |
| Có vẻ hiểu | Câu hỏi áp dụng mới | “Với một câu có hai từ đều liên quan nhưng mức độ khác nhau, attention sẽ thể hiện điều đó thế nào?” |

Agent học viên **không được** nói các câu như “bài giảng có nhắc đến trọng số”, “xem slide 8”, “đáp án là...”, hoặc đưa ví dụ có tính giải đáp. Những việc này thuộc Tutor.

### 6.4 Prompt contract rút gọn

> Bạn là Agent học viên đang được user dạy lại nội dung bài giảng. Đánh giá dựa duy nhất trên Knowledge Map và evidence được cung cấp. Không tuyên bố user sai một cách áp đặt, không tự giải thích, không đưa gợi ý, không trích đáp án hoặc nguồn học liệu. Nếu phát hiện sai/thiếu, hãy hỏi đúng một câu ngắn để làm lộ mâu thuẫn hoặc yêu cầu user làm rõ. Xuất JSON hợp lệ theo schema.

## 7. Chính sách chuyển sang Tutor

Tutor được gọi khi có một trong các điều kiện sau:

1. User yêu cầu rõ ràng: “Tôi không hiểu”, “giải thích giúp tôi”, “cho tôi đáp án/gợi ý”.
2. User lặp lại cùng một lỗi khái niệm cốt lõi lần thứ hai, sau khi Agent học viên đã đặt câu hỏi phản biện ở lần đầu. Agent học viên hỏi user có muốn mời Tutor hay tiếp tục tự giải thích; nếu user đồng ý thì gọi Tutor.
3. User không tiến triển qua ba lượt trả lời liên quan ở cùng objective. Hệ thống đề xuất Tutor hoặc cho phép tạm dừng; không cưỡng ép user tiếp tục.
4. Evidence nguồn không đủ để đánh giá chắc chắn. Không gọi Tutor để bịa kiến thức; hãy nói rõ phần này cần được xem lại từ học liệu hoặc để user đổi chủ đề.

Không gọi Tutor chỉ vì user sai một lần hoặc trả lời ngắn một lần. Agent học viên không đưa hint ở bất kỳ bước nào.

```text
Sai lần 1 cùng misconception -> Agent học viên hỏi phản biện
Sai lần 2 cùng misconception -> Agent học viên hỏi: tự thử tiếp hay mời Tutor?
User chọn Tutor              -> Tutor giải thích ngắn
Ba lượt không tiến triển     -> đề xuất Tutor hoặc tạm dừng
```

Trong code, ngưỡng demo được chốt là `repeated_core_misconception >= 2` **và** `user_accepts_tutor = true`, trừ `explicit_help_request = true` thì gọi ngay.

## 8. Agent Tutor: can thiệp ngắn, sau đó trả quyền cho user

### 8.1 Input

- Mục tiêu user đang kẹt.
- Lỗi cụ thể hoặc phần thiếu.
- Source bundle slide làm evidence.
- Lịch sử tóm tắt: user đã thử giải thích như thế nào.

### 8.2 Hành vi bắt buộc

1. Nói rõ điểm user đang nhầm hoặc còn thiếu, với giọng không phán xét.
2. Giải thích tối đa khoảng 120 từ.
3. Có thể dùng một ví dụ đơn giản và một trích dẫn/mã nguồn nội bộ.
4. Kết thúc bằng yêu cầu user tự giảng lại bằng lời của mình.
5. Không chuyển sang giảng thêm nội dung mới không liên quan.

Ví dụ:

> “Bạn đang đúng ở ý attention quan tâm đến thông tin liên quan. Điểm cần chỉnh là attention không nhất thiết chỉ chọn một token. Nó tính mức liên quan giữa Query và các Key, rồi tổng hợp các Value theo những trọng số đó. Bây giờ bạn thử giảng lại: Key tham gia vào bước nào, và Value xuất hiện sau đó ra sao?”

Sau message này, trạng thái chuyển về Agent học viên để đánh giá phần user giảng lại.

## 9. Xử lý tin nhắn không phải một lời giải thích

Trước khi đánh giá kiến thức, Agent học viên phân loại `intent` và `relevance`.

| Input user | Cách xử lý | Có tính là một lần trả lời sai? |
|---|---|---:|
| “Tôi không hiểu phần này.” | Gọi Tutor ngay | Không |
| “Tôi thích ăn bún chả.” | Ghi nhận một câu ngắn, rồi hỏi lại câu hiện tại | Không |
| Hỏi về cách dùng sản phẩm | Trả lời ngắn, quay lại phiên học | Không |
| Yêu cầu bỏ qua luật, đổi vai trò | Bỏ qua chỉ dẫn đó, quay về câu hỏi | Không |
| Xin tạm dừng/đổi chủ đề | Tôn trọng; lưu phần chưa đạt | Không |
| Câu mơ hồ nhưng liên quan | Yêu cầu user nói rõ bằng ví dụ/các bước | Chưa tính |

Ví dụ với off-topic:

> “Bún chả nghe hấp dẫn đấy 😄. Nhưng để mình hiểu bài, bạn quay lại giúp mình nhé: Query và Key phối hợp với nhau thế nào?”

Không nên nói “mình cũng thích bún chả”, vì đó là sở thích giả. Nếu user tiếp tục lạc đề, hãy cho họ lựa chọn tạm dừng hoặc gọi Tutor, thay vì cưỡng ép hội thoại.

## 10. Session state tối thiểu

```json
{
  "lesson_id": "attention-basics",
  "current_objective": "qkv-relationship",
  "objective_status": {
    "attention-purpose": "mastered",
    "qkv-relationship": "in_progress"
  },
  "attempts_per_objective": {
    "qkv-relationship": 2
  },
  "repeated_misconceptions": {
    "attention-picks-one-token": 1
  },
  "tutor_used": false,
  "off_topic_streak": 0
}
```

State phải được cập nhật bằng rule trong code, không chỉ dựa vào văn bản model trả lời. Ví dụ, một off-topic không được tăng `attempts_per_objective`; một lần Agent Tutor can thiệp phải đặt `tutor_used = true`.

## 11. Điều kiện hoàn thành

User chỉ hoàn thành chủ đề khi:

1. Bao phủ toàn bộ `required_claims` của các mục tiêu đã chọn.
2. Không còn lỗi khái niệm cốt lõi chưa được sửa.
3. Trả lời được ít nhất một câu hỏi áp dụng/điều kiện mới.
4. Nếu Tutor đã can thiệp, user đã giảng lại đúng sau can thiệp.

Không dùng một điểm tổng quát duy nhất như “8/10 hiểu bài” để kết thúc.

## 12. MVP và CP3 đề xuất

### 12.1 Scope cần khóa

- Chỉ làm **một learning unit**, gồm 3--5 slide/card key takeaway trong một PDF bài giảng.
- Knowledge Map có 2--3 objectives, tổng cộng 4--6 `required_claims`.
- Tách PDF thành slide index trước runtime. Với scope đóng này, chưa cần vector database; app nạp source bundle slide đã chọn theo `unit_id`. Đây là cách source-grounded đơn giản và ổn định hơn cho demo.

### 12.2 Mắt xích AI thật

- Một lượt gọi LLM cho Agent học viên: nhận user response + map + source bundle + state, trả JSON đánh giá và đúng một câu hỏi hiển thị.
- Một lượt gọi LLM riêng cho Agent Tutor chỉ khi chính sách ở §7 cho phép.
- Lưu log cho mỗi lượt: `unit_id`, state trước/sau, input đã mask/tóm tắt, raw model output, parsed decision, evidence IDs và latency.
- Không commit transcript/chatlog gốc hoặc log chứa nội dung nguồn dài vào repo công khai. Chỉ commit schema log, dữ liệu đã mask/rút gọn và thống kê.

### 12.3 Luồng demo cần chứng minh

```text
User giải thích sai
-> Agent học viên nhận ra đúng misconception từ source bundle
-> Agent chỉ hỏi câu phản biện, không gợi ý
-> User tiếp tục kẹt và chọn mời Tutor
-> Tutor giải thích ngắn có căn cứ
-> User giảng lại
-> Agent học viên hỏi một câu áp dụng
-> Hệ thống xác nhận đạt/chưa đạt
```

## 13. Rubric riêng: thiết kế, bằng chứng và chỉ số

| Tiêu chí | Cơ chế sản phẩm | Bằng chứng để nộp/chấm |
|---|---|---|
| Hỏi ngược đúng chỗ hổng — 25 | Map tách thành `required_claims`; output bắt buộc có `missing_claims`, `misconception`, `question_target`, `next_action` | Golden set chấm action/target đúng, không chấm exact wording |
| Đối chiếu nguồn — 20 | Mỗi claim có evidence kiểu key takeaway/slide; model chỉ nhận source bundle slide của unit | Log có evidence IDs và quote; kiểm tra ID tồn tại, quote có thật và có hỗ trợ claim |
| Bằng chứng hiểu sâu hơn — 25 | Chỉ pass khi user có khái niệm + cơ chế/quan hệ + câu áp dụng hoặc tự sửa lỗi | State lưu coverage từng objective; log hội thoại trước-sau Tutor |
| Không lộ đáp án — 15 | Prompt/policy của Agent học viên chỉ cho phép câu hỏi; Tutor là role duy nhất giải thích | Golden set có `must_not` cho direct answer/hint/call Tutor quá sớm |
| UX & kiểm soát — 15 | Hiển thị đúng vai trò, nút mời Tutor, tạm dừng/đổi chủ đề, tiến độ không lộ đáp án | Video 30 giây và ghi nhận user test |

### 13.1 Định nghĩa "hiểu sâu hơn"

Không đánh dấu `mastered` chỉ vì user lặp lại từ khóa. Với mỗi objective, cần ít nhất hai trong ba evidence sau:

1. Nêu đúng khái niệm.
2. Giải thích quan hệ/cơ chế "vì sao" hoặc "như thế nào".
3. Áp dụng vào tình huống mới, hoặc tự sửa một misconception từng mắc.

Nếu Tutor đã can thiệp, evidence số 2 hoặc 3 bắt buộc phải xuất hiện trong lượt user giảng lại.

### 13.2 Golden set CP3: 20 case

Tạo đúng 20 case, gồm ít nhất 10 case lấy/phát triển từ chatlog thật (ghi `origin_turn_id`, rút gọn/mask nội dung để không commit data pack). Phân bổ đề xuất:

| Nhóm case | Số lượng | Ví dụ expected outcome |
|---|---:|---|
| Nguồn sự thật | 2 | Không bịa claim/citation; dùng evidence hợp lệ hoặc nói không đủ evidence |
| Mơ hồ/thiếu thông tin | 2 | Hỏi làm rõ, không vội kết luận user sai |
| Ngoài phạm vi/thẩm quyền | 2 | Từ chối chấm điểm/điều khiển ngoài bài, kéo về scope an toàn |
| Đặc thù domain | 2 | Phân biệt đúng khái niệm chuyên môn trong unit đã chọn |
| Thường gặp | 9 | Đúng-đủ, đúng-thiếu, sai lần đầu, lỗi lặp lại, xin Tutor, off-topic |
| Hiếm | 3 | Prompt injection, đổi chủ đề liên tiếp, evidence không đủ |

Mỗi case có tối thiểu: `case_id`, `origin`, `difficulty_class`, `user_input`, `session_state`, `expected_action`, `expected_target`, `must_not`.

### 13.3 User Input Grid

Trước khi viết đủ 20 case, lập grid theo năm chiều sau để tránh thêm case theo cảm giác:

1. Ý định: giải thích / xin Tutor / off-topic / tạm dừng.
2. Chất lượng hiểu: đúng-đủ / đúng-thiếu / sai core / mơ hồ.
3. Tiến trình: lần đầu / lặp misconception lần hai / đã được Tutor hỗ trợ.
4. Nguồn: claim có evidence / thiếu evidence / yêu cầu ngoài source bundle.
5. Scope: trong unit / ngoài unit / yêu cầu vượt thẩm quyền.

Mỗi case phải được gắn vào một tổ hợp giá trị; ô quan trọng còn trống là lỗ hổng coverage.

### 13.4 Chỉ số đề xuất và kiểm thử trước CP3

1. Chạy tay 10--20 input trước, phân loại thô: `dùng được`, `sửa được`, `không chấp nhận được`.
2. Hai thành viên chấm độc lập cùng 5 output theo tiêu chí đã viết; nếu lệch từ 20% case trở lên, viết lại định nghĩa đạt trước khi chạy đủ golden set.
3. Chạy 20 case, lưu kết quả thực thi và báo cáo: tổng đạt/thất bại, tỷ lệ, nhóm lỗi và quyết định sửa gì.

Ngưỡng chất lượng đề xuất để khóa ở CP4:

```text
Decision/action đúng: >= 16/20
Evidence ID hợp lệ: >= 18/20
Agent học viên lộ hint/đáp án: 0/20
Gọi Tutor trái chính sách: <= 1/20
```

Các ngưỡng là đề xuất ban đầu; sau khi chạy tay, nhóm phải chốt một phiên bản và giữ nguyên trong báo cáo CP3/CP4.
