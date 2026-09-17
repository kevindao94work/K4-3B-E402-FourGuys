/**
 * ExplainLab - Prototype Track D3: Học bằng cách dạy
 * Flow tương tác 2 LLMs: LLM Học viên & LLM Trợ giảng
 * Clean Slate Minimalist - 100% Flat Colors - Không dependency
 */

// ==========================================
// DỮ LIỆU BÀI HỌC VÀ KỊCH BẢN 2 LLMS
// ==========================================

const LESSON_DATA = {
  id: "lesson_4",
  title: "Bài 4: Cơ chế sinh & Tham số ngẫu nhiên trong LLM",
  documentSource: "Slide_Bai4_LLM_Generation_Params.pdf (18 trang)",
  overview: "LLM Học viên đã đọc toàn bộ slide bài học và chuẩn bị 3 câu hỏi cốt lõi để bạn giảng dạy lại.",
  
  questions: [
    {
      id: "q1",
      topic: "Đề tài 1: Cơ chế sinh và tính bất định",
      promptToUser: "Chào anh/chị! Em vừa đọc slide Bài 4. Anh/chị dạy giúp em: Vì sao mỗi lần gửi cùng một câu hỏi (prompt), LLM lại có thể đưa ra câu trả lời khác nhau ạ?",
      learningGoal: "Giải thích được cơ chế sinh từ theo phân phối xác suất và quá trình lấy mẫu (Sampling) thay vì trả lời tất định.",
      slideRef: "Slide 6 — Probability Distribution & Token Sampling",
      
      // Kịch bản mẫu cho nút demo và phân tích
      scenarios: {
        sufficient: {
          userAnswer: "Mô hình ngôn ngữ không trả lời cố định mà tính toán phân phối xác suất cho từng token tiếp theo. Khi sinh văn bản, thuật toán lấy mẫu (sampling) sẽ chọn từ dựa trên xác suất đó, nên cùng một prompt vẫn có thể ra các chuỗi từ khác nhau qua mỗi lần chạy.",
          aiFeedback: "Dạ em hiểu rất rõ rồi ạ! Mô hình dự đoán xác suất từng token chứ không cố định từ ngữ, và chính bước lấy mẫu (sampling) tạo nên sự khác biệt giữa các lần trả lời. Em cảm ơn anh/chị!",
          statusTag: "Đủ ý — Đạt",
          statusType: "sufficient"
        },
        partial: {
          userAnswer: "Vì AI có tính ngẫu nhiên nên mỗi lần nó tự chọn một cách nói khác nhau cho đỡ chán.",
          aiFeedback: "Em hiểu là có yếu tố ngẫu nhiên, nhưng em chưa rõ 'tính ngẫu nhiên' đó từ đâu ra trong mô hình? Anh/chị có thể giải thích thêm về cách mô hình tính toán và chọn từ tiếp theo được không ạ?",
          statusTag: "Thiếu ý — Cần gợi ý thêm",
          statusType: "partial"
        },
        incorrect: {
          userAnswer: "Do LLM tự động cập nhật kiến thức mới liên tục từ Internet sau mỗi giây nên câu trả lời bị đổi.",
          aiFeedback: "Ơ nhưng theo slide 4 thì trọng số của LLM là cố định sau khi huấn luyện, mô hình không tự tra Internet nếu không có công cụ tìm kiếm bên ngoài ạ. Anh/chị xem lại xem nguyên nhân thật sự trong cơ chế sinh từ là gì nhé?",
          statusTag: "Chưa đúng — Chỉ ra chỗ sai",
          statusType: "incorrect"
        },
        taIntervention: {
          taExplanation: "Chào bạn, mình là Trợ giảng AI. Nhận thấy bạn đang lúng túng ở câu này sau 3 lượt giải thích chưa chuẩn xác, mình xin tóm lược kiến thức chuẩn từ Slide 6: Bản chất LLM là mô hình xác suất. Sau mỗi bước, mô hình tính điểm cho hàng ngàn từ trong từ điển và chuyển thành phân phối xác suất. Thuật toán Sampling sẽ bốc ngẫu nhiên từ theo tỷ lệ đó, tạo ra các câu trả lời khác nhau. Bạn hãy ghi nhớ điểm này nhé!",
          statusTag: "Trợ giảng hỗ trợ sau 3 lần sai",
          statusType: "ta"
        }
      }
    },

    {
      id: "q2",
      topic: "Đề tài 2: Vai trò của Temperature và Top-p",
      promptToUser: "Em thấy trên giao diện có thanh trượt Temperature và Top-p. Hai tham số này dùng để làm gì và ảnh hưởng thế nào đến câu trả lời ạ?",
      learningGoal: "Phân biệt được Temperature (độ phẳng phân phối) và Top-p / Nucleus Sampling (giới hạn vùng xác suất tích lũy).",
      slideRef: "Slide 11 — Temperature Scaling & Nucleus Sampling (Top-p)",
      
      scenarios: {
        sufficient: {
          userAnswer: "Temperature dùng để điều chỉnh độ phân tán xác suất: nhiệt độ thấp khiến các từ có xác suất cao càng nổi bật hơn (câu trả lời chuẩn xác), nhiệt độ cao làm phẳng phân phối giúp câu trả lời đa dạng hơn. Còn Top-p giới hạn việc chọn từ trong nhóm các từ có tổng xác suất tích lũy đạt ngưỡng p.",
          aiFeedback: "Tuyệt vời ạ! Em đã nắm chắc: Temperature làm nhọn hoặc phẳng phân phối, còn Top-p cắt đuôi các từ ít liên quan theo ngưỡng tích lũy. Rất dễ hiểu!",
          statusTag: "Đủ ý — Đạt",
          statusType: "sufficient"
        },
        partial: {
          userAnswer: "Hai cái này dùng để chỉnh cho câu trả lời của AI sáng tạo hơn hoặc thông minh hơn bình thường.",
          aiFeedback: "Dạ đúng là liên quan đến mức độ sáng tạo, nhưng về mặt kỹ thuật thì Temperature tác động thế nào đến xác suất của các từ hả anh/chị? Anh/chị dạy thêm cho em chỗ phân phối xác suất với ạ!",
          statusTag: "Thiếu ý — Cần gợi ý thêm",
          statusType: "partial"
        },
        incorrect: {
          userAnswer: "Temperature là nhiệt độ phần cứng của chip GPU, nếu tăng cao thì AI xử lý nhanh hơn.",
          aiFeedback: "Dạ không phải đâu ạ! Slide 9 ghi rõ Temperature ở đây là một tham số toán học chia vào logits trong hàm Softmax, hoàn toàn không liên quan đến nhiệt độ vật lý của GPU. Anh/chị thử giải thích lại xem tham số này ảnh hưởng thế nào đến việc chọn từ ạ?",
          statusTag: "Chưa đúng — Chỉ ra chỗ sai",
          statusType: "incorrect"
        },
        taIntervention: {
          taExplanation: "Chào bạn, mình là Trợ giảng AI. Do đã qua 3 lượt thử, mình xin tóm lược căn cứ từ Slide 11: Temperature là hệ số chia vào Logits trước khi qua hàm Softmax. Khi T tiến về 0, mô hình ưu tiên tuyệt đối từ có điểm cao nhất. Khi T cao, khoảng cách xác suất giữa các từ thu hẹp. Còn Top-p (Nucleus Sampling) chỉ giữ lại các token có tổng xác suất tích lũy đến giá trị p (ví dụ 0.9), loại bỏ hẳn các từ vô nghĩa. Chúng ta chuyển tiếp câu cuối nhé!",
          statusTag: "Trợ giảng hỗ trợ sau 3 lần sai",
          statusType: "ta"
        }
      }
    },

    {
      id: "q3",
      topic: "Đề tài 3: Ứng dụng thực tế theo nhiệm vụ",
      promptToUser: "Khi em cần AI viết code hoặc trích xuất dữ liệu JSON từ hóa đơn, em nên đặt Temperature bằng bao nhiêu và vì sao ạ?",
      learningGoal: "Hiểu được việc chọn Temperature = 0 (Greedy Decoding) cho các tác vụ cần tính chính xác, tất định và không bị ảo giác.",
      slideRef: "Slide 15 — Production Guidelines for Tasks & Temperature",
      
      scenarios: {
        sufficient: {
          userAnswer: "Em nên đặt Temperature = 0 (hoặc rất gần 0). Vì các tác vụ viết code và trích xuất dữ liệu đòi hỏi tính chính xác, đúng cú pháp và kết quả tất định (deterministic). Nếu đặt cao, AI sẽ sáng tạo bừa bãi và gây lỗi cú pháp.",
          aiFeedback: "Dạ chuẩn xác luôn ạ! Với tác vụ logic, trích xuất dữ liệu hoặc code thì cần tính tất định và ít sai lệch nhất, nên luôn ưu tiên Temperature = 0 (Greedy search). Em đã nắm vững toàn bộ bài rồi ạ!",
          statusTag: "Đủ ý — Đạt",
          statusType: "sufficient"
        },
        partial: {
          userAnswer: "Nên đặt giá trị nhỏ, tầm 0 chấm mấy đó để nó làm việc nghiêm túc hơn.",
          aiFeedback: "Dạ đặt nhỏ là đúng hướng rồi ạ, nhưng mức tối ưu nhất cho bài toán lập trình hoặc trích xuất dữ liệu cấu trúc là con số mấy? Và tại sao nó lại tránh được lỗi cú pháp ạ?",
          statusTag: "Thiếu ý — Cần gợi ý thêm",
          statusType: "partial"
        },
        incorrect: {
          userAnswer: "Nên đặt Temperature = 1.0 hoặc tối đa để AI thông minh và sáng tạo ra nhiều đoạn code độc đáo.",
          aiFeedback: "Dạ như vậy rất nguy hiểm ạ! Khi viết code hay trích xuất JSON, nếu để Temperature cao thì mô hình sẽ sinh ra các ký tự ngẫu nhiên làm hỏng cú pháp (Syntax error) hoặc bị ảo giác sai số liệu. Anh/chị xem lại khuyến nghị ở Slide 14 nhé!",
          statusTag: "Chưa đúng — Chỉ ra chỗ sai",
          statusType: "incorrect"
        },
        taIntervention: {
          taExplanation: "Chào bạn, Trợ giảng AI xin đúc kết quy tắc chuẩn từ Slide 15: Đối với các tác vụ Tất định (Deterministic tasks) như Viết Code, Toán học, Trích xuất thực thể, Phân tích JSON, bắt buộc cấu hình Temperature = 0 (hoặc Greedy decoding). Ngược lại, Temperature từ 0.7 - 1.0 chỉ dùng cho Sáng tác văn học, Brainstorm ý tưởng, Viết email mở rộng.",
          statusTag: "Trợ giảng hỗ trợ sau 3 lần sai",
          statusType: "ta"
        }
      }
    }
  ]
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

const state = {
  currentStep: 1, // 1: Đề tài, 2: Phòng dạy học, 3: Dashboard
  currentQuestionIndex: 0,
  attemptCount: 0, // 0 -> 3
  chatHistory: [], // { sender: 'student'|'user'|'ta', text: '', statusTag: '', statusType: '' }
  questionResults: [] // { questionId, attempts, mastered: boolean, notes: [] }
};

// ==========================================
// DOM CACHE
// ==========================================

let dom = {};

function initDom() {
  dom = {
    // Stepper
    stepperItems: document.querySelectorAll(".step-item"),
    stepperTrackFill: document.getElementById("stepperTrackFill"),

    // Screens
    screen1: document.getElementById("screen1"),
    screen2: document.getElementById("screen2"),
    screen3: document.getElementById("screen3"),

    // Global
    btnResetApp: document.getElementById("btnResetApp"),

    // Screen 1
    btnStartTeaching: document.getElementById("btnStartTeaching"),

    // Screen 2
    roomQuestionIndex: document.getElementById("roomQuestionIndex"),
    roomAttemptBadge: document.getElementById("roomAttemptBadge"),
    chatStream: document.getElementById("chatStream"),
    roomTextarea: document.getElementById("roomTextarea"),
    charCount: document.getElementById("charCount"),
    inlineError: document.getElementById("inlineError"),
    btnSubmitAnswer: document.getElementById("btnSubmitAnswer"),
    btnSimSufficient: document.getElementById("btnSimSufficient"),
    btnSimPartial: document.getElementById("btnSimPartial"),
    btnSimIncorrect: document.getElementById("btnSimIncorrect"),
    btnSimTA: document.getElementById("btnSimTA"),

    // Screen 3 Dashboard
    metricMastery: document.getElementById("metricMastery"),
    metricDetail: document.getElementById("metricDetail"),
    listMastered: document.getElementById("listMastered"),
    listNeedReview: document.getElementById("listNeedReview"),
    listRecommendations: document.getElementById("listRecommendations"),
    btnRestartSession: document.getElementById("btnRestartSession")
  };
}

// ==========================================
// STEP CONTROLLER
// ==========================================

function goToStep(step) {
  state.currentStep = step;

  // Cập nhật Stepper
  dom.stepperItems.forEach((item) => {
    const s = parseInt(item.dataset.step, 10);
    item.classList.remove("active", "completed");
    if (s < step) item.classList.add("completed");
    else if (s === step) item.classList.add("active");
  });

  if (dom.stepperTrackFill) {
    const pct = step === 1 ? 0 : step === 2 ? 50 : 100;
    dom.stepperTrackFill.style.width = `${pct}%`;
  }

  // Chuyển view
  dom.screen1.classList.toggle("active", step === 1);
  dom.screen2.classList.toggle("active", step === 2);
  dom.screen3.classList.toggle("active", step === 3);

  if (step === 2) {
    setupTeachingRoom();
  } else if (step === 3) {
    renderDashboard();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==========================================
// STEP 2: PHÒNG DẠY HỌC TƯƠNG TÁC (2 LLMs)
// ==========================================

function setupTeachingRoom() {
  const currentQ = LESSON_DATA.questions[state.currentQuestionIndex];
  state.attemptCount = 0;
  state.chatHistory = [];

  updateRoomHeader();
  dom.chatStream.innerHTML = "";
  dom.roomTextarea.value = "";
  updateCharCounter();
  hideError();

  // Tin nhắn mở đầu của LLM Học viên
  addChatMessage({
    sender: "student",
    text: currentQ.promptToUser,
    statusTag: "Câu hỏi từ LLM Học viên",
    statusType: "normal"
  });

  setTimeout(() => {
    dom.roomTextarea.focus();
  }, 100);
}

function updateRoomHeader() {
  const qNum = state.currentQuestionIndex + 1;
  const totalQ = LESSON_DATA.questions.length;
  dom.roomQuestionIndex.textContent = `Đề tài ${qNum}/${totalQ}`;

  const attempts = state.attemptCount;
  dom.roomAttemptBadge.textContent = `Lượt thử: ${attempts}/3`;
  dom.roomAttemptBadge.className = "attempt-badge";

  if (attempts === 2) {
    dom.roomAttemptBadge.classList.add("attempt-warning");
  } else if (attempts >= 3) {
    dom.roomAttemptBadge.classList.add("attempt-danger");
  }
}

function addChatMessage({ sender, text, statusTag, statusType }) {
  state.chatHistory.push({ sender, text, statusTag, statusType });

  const msgDiv = document.createElement("div");
  msgDiv.className = `chat-message ${sender}`;

  let senderName = "Học viên AI";
  if (sender === "user") senderName = "Bạn (Người dạy)";
  if (sender === "ta") senderName = "Trợ giảng AI";

  let statusHtml = "";
  if (statusTag && statusType !== "normal") {
    let pillClass = "eval-sufficient";
    if (statusType === "partial") pillClass = "eval-partial";
    else if (statusType === "incorrect") pillClass = "eval-incorrect";
    else if (statusType === "ta") pillClass = "eval-ta";

    statusHtml = `<span class="eval-status-pill ${pillClass}">${escapeHTML(statusTag)}</span>`;
  }

  msgDiv.innerHTML = `
    <div class="msg-sender-label">
      <span>${senderName}</span>
      ${statusTag && statusType === "normal" ? `<span style="font-size: 0.7rem; color: var(--slate-400); font-weight: 500;">(${escapeHTML(statusTag)})</span>` : ""}
    </div>
    <div class="msg-bubble">
      ${statusHtml}
      <div>${escapeHTML(text)}</div>
    </div>
  `;

  dom.chatStream.appendChild(msgDiv);
  dom.chatStream.scrollTop = dom.chatStream.scrollHeight;
}

// Xử lý gửi lời giải thích từ người dùng
function handleUserSubmit(overrideText = null, overrideType = null) {
  const text = overrideText !== null ? overrideText : dom.roomTextarea.value.trim();

  if (!text) {
    showError("Vui lòng nhập lời giải thích của bạn trước khi gửi.");
    return;
  }
  hideError();

  // 1. Thêm tin nhắn của User vào hội thoại
  addChatMessage({
    sender: "user",
    text: text
  });

  dom.roomTextarea.value = "";
  updateCharCounter();

  // 2. LLM Học viên đánh giá câu trả lời
  processEvaluation(text, overrideType);
}

// Chấm độ hoàn thiện và phản hồi theo 4 nhánh nghiệp vụ
function processEvaluation(userText, forceType = null) {
  const currentQ = LESSON_DATA.questions[state.currentQuestionIndex];
  state.attemptCount++;
  updateRoomHeader();

  let scenarioResult;

  if (forceType) {
    scenarioResult = currentQ.scenarios[forceType];
  } else {
    // Phân tích heuristic nhẹ dựa trên từ khóa trong câu trả lời người dùng
    const lower = userText.toLowerCase();
    if (lower.includes("xác suất") || lower.includes("sampling") || lower.includes("tất định") || lower.includes("phân phối") || lower.includes("0")) {
      scenarioResult = currentQ.scenarios.sufficient;
    } else if (lower.includes("nhiệt độ chip") || lower.includes("gpu") || lower.includes("internet") || lower.includes("1.0")) {
      scenarioResult = currentQ.scenarios.incorrect;
    } else {
      scenarioResult = currentQ.scenarios.partial;
    }
  }

  // Trường hợp 4: Nếu sai/thiếu lặp lại 3 lần -> Trợ giảng AI xuất hiện
  if (state.attemptCount >= 3 && scenarioResult.statusType !== "sufficient") {
    triggerTeachingAssistantIntervention(currentQ);
    return;
  }

  // Trường hợp 1: Nếu Đủ ý -> Chúc mừng và chuyển sang câu tiếp theo
  if (scenarioResult.statusType === "sufficient") {
    setTimeout(() => {
      addChatMessage({
        sender: "student",
        text: scenarioResult.aiFeedback,
        statusTag: scenarioResult.statusTag,
        statusType: "sufficient"
      });

      // Lưu kết quả câu này
      saveQuestionResult({
        questionId: currentQ.id,
        topic: currentQ.topic,
        mastered: true,
        attempts: state.attemptCount,
        note: "Giải thích rõ ràng, đúng trọng tâm phân phối xác suất và cơ chế lấy mẫu."
      });

      // Sau 1.2s chuyển câu tiếp theo hoặc sang Dashboard
      setTimeout(advanceToNextQuestion, 1200);
    }, 400);
    return;
  }

  // Trường hợp 2: Nếu Thiếu ý -> Hỏi thêm để gợi ý học viên đến câu trả lời đúng
  if (scenarioResult.statusType === "partial") {
    setTimeout(() => {
      addChatMessage({
        sender: "student",
        text: scenarioResult.aiFeedback,
        statusTag: scenarioResult.statusTag,
        statusType: "partial"
      });
    }, 400);
    return;
  }

  // Trường hợp 3: Nếu Sai -> Chỉ ra chỗ sai và hỏi lại học viên
  if (scenarioResult.statusType === "incorrect") {
    setTimeout(() => {
      addChatMessage({
        sender: "student",
        text: scenarioResult.aiFeedback,
        statusTag: scenarioResult.statusTag,
        statusType: "incorrect"
      });
    }, 400);
    return;
  }
}

// Kích hoạt Trợ giảng AI can thiệp
function triggerTeachingAssistantIntervention(currentQ) {
  setTimeout(() => {
    addChatMessage({
      sender: "ta",
      text: currentQ.scenarios.taIntervention.taExplanation,
      statusTag: currentQ.scenarios.taIntervention.statusTag,
      statusType: "ta"
    });

    saveQuestionResult({
      questionId: currentQ.id,
      topic: currentQ.topic,
      mastered: false,
      attempts: 3,
      note: `Cần Trợ giảng AI giảng giải lại kiến thức chuẩn từ ${currentQ.slideRef}.`
    });

    setTimeout(advanceToNextQuestion, 1600);
  }, 400);
}

// Chuyển sang câu hỏi kế tiếp hoặc kết thúc buổi dạy
function advanceToNextQuestion() {
  if (state.currentQuestionIndex < LESSON_DATA.questions.length - 1) {
    state.currentQuestionIndex++;
    setupTeachingRoom();
  } else {
    // Hết câu hỏi -> Chuyển sang Dashboard
    goToStep(3);
  }
}

function saveQuestionResult(result) {
  // Thay thế nếu đã có hoặc thêm mới
  const existingIdx = state.questionResults.findIndex((r) => r.questionId === result.questionId);
  if (existingIdx >= 0) {
    state.questionResults[existingIdx] = result;
  } else {
    state.questionResults.push(result);
  }
}

// ==========================================
// STEP 3: DASHBOARD TỔNG KẾT
// ==========================================

function renderDashboard() {
  const totalQ = LESSON_DATA.questions.length;
  const masteredCount = state.questionResults.filter((r) => r.mastered).length;
  const pct = Math.round((masteredCount / totalQ) * 100);

  dom.metricMastery.textContent = `${pct}%`;
  dom.metricDetail.textContent = `(${masteredCount}/${totalQ} đề tài đã dạy thành công)`;

  // 1. Giải thích được những gì
  dom.listMastered.innerHTML = "";
  const masteredItems = state.questionResults.filter((r) => r.mastered);
  if (masteredItems.length === 0) {
    dom.listMastered.innerHTML = `<li class="dash-item"><span class="dash-bullet">—</span><div>Chưa có đề tài nào đạt chuẩn trọn vẹn trong lần thử đầu. Cần luyện tập thêm.</div></li>`;
  } else {
    masteredItems.forEach((item) => {
      const li = document.createElement("li");
      li.className = "dash-item";
      li.innerHTML = `
        <span class="dash-bullet">—</span>
        <div><strong>${escapeHTML(item.topic)}:</strong> ${escapeHTML(item.note)} (${item.attempts} lượt trả lời)</div>
      `;
      dom.listMastered.appendChild(li);
    });
  }

  // 2. Còn chưa được những gì
  dom.listNeedReview.innerHTML = "";
  const unmasteredItems = state.questionResults.filter((r) => !r.mastered);
  if (unmasteredItems.length === 0) {
    dom.listNeedReview.innerHTML = `<li class="dash-item"><span class="dash-bullet">—</span><div>Không có kiến thức nào bị hổng nghiêm trọng. Bạn nắm bài rất vững vàng.</div></li>`;
  } else {
    unmasteredItems.forEach((item) => {
      const li = document.createElement("li");
      li.className = "dash-item";
      li.innerHTML = `
        <span class="dash-bullet">—</span>
        <div><strong>${escapeHTML(item.topic)}:</strong> ${escapeHTML(item.note)}</div>
      `;
      dom.listNeedReview.appendChild(li);
    });
  }

  // 3. Cần ôn tập lại gì (Khuyến nghị slide cụ thể)
  dom.listRecommendations.innerHTML = "";
  LESSON_DATA.questions.forEach((q) => {
    const res = state.questionResults.find((r) => r.questionId === q.id);
    const li = document.createElement("li");
    li.className = "dash-item";

    if (!res || !res.mastered) {
      li.innerHTML = `
        <span class="dash-bullet">—</span>
        <div><strong>Đọc lại ${escapeHTML(q.slideRef)}:</strong> Chú ý mục tiêu "${escapeHTML(q.learningGoal)}" trước khi làm bài kiểm tra tiếp theo.</div>
      `;
    } else {
      li.innerHTML = `
        <span class="dash-bullet">—</span>
        <div><strong>Đã vững ${escapeHTML(q.slideRef)}:</strong> Có thể chuyển tiếp sang bài tập thực hành nâng cao.</div>
      `;
    }
    dom.listRecommendations.appendChild(li);
  });
}

// ==========================================
// UI HELPERS & SIMULATION SHORTCUTS
// ==========================================

function updateCharCounter() {
  const len = dom.roomTextarea.value.length;
  dom.charCount.textContent = `${len} ký tự`;
}

function showError(msg) {
  dom.inlineError.textContent = msg;
  dom.inlineError.classList.add("visible");
  dom.roomTextarea.classList.add("has-error");
}

function hideError() {
  dom.inlineError.classList.remove("visible");
  dom.roomTextarea.classList.remove("has-error");
}

function escapeHTML(str) {
  if (!str) return "";
  const p = document.createElement("p");
  p.appendChild(document.createTextNode(str));
  return p.innerHTML;
}

function resetEntireApp() {
  state.currentStep = 1;
  state.currentQuestionIndex = 0;
  state.attemptCount = 0;
  state.chatHistory = [];
  state.questionResults = [];
  goToStep(1);
}

// ==========================================
// EVENT LISTENERS INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  initDom();

  // Reset Button
  dom.btnResetApp.addEventListener("click", resetEntireApp);
  dom.btnRestartSession.addEventListener("click", resetEntireApp);

  // Screen 1 -> Screen 2
  dom.btnStartTeaching.addEventListener("click", () => {
    state.currentQuestionIndex = 0;
    state.questionResults = [];
    goToStep(2);
  });

  // Screen 2 Form inputs
  dom.roomTextarea.addEventListener("input", () => {
    updateCharCounter();
    if (dom.roomTextarea.value.trim()) hideError();
  });

  dom.btnSubmitAnswer.addEventListener("click", () => handleUserSubmit());

  // Quick Simulation Buttons (Hỗ trợ demo 4 nhánh flow)
  dom.btnSimSufficient.addEventListener("click", () => {
    const q = LESSON_DATA.questions[state.currentQuestionIndex];
    handleUserSubmit(q.scenarios.sufficient.userAnswer, "sufficient");
  });

  dom.btnSimPartial.addEventListener("click", () => {
    const q = LESSON_DATA.questions[state.currentQuestionIndex];
    handleUserSubmit(q.scenarios.partial.userAnswer, "partial");
  });

  dom.btnSimIncorrect.addEventListener("click", () => {
    const q = LESSON_DATA.questions[state.currentQuestionIndex];
    handleUserSubmit(q.scenarios.incorrect.userAnswer, "incorrect");
  });

  dom.btnSimTA.addEventListener("click", () => {
    const q = LESSON_DATA.questions[state.currentQuestionIndex];
    // Ép vượt qua 3 lượt sai để kích hoạt Trợ giảng AI
    state.attemptCount = 2; // sẽ thành 3 trong processEvaluation
    handleUserSubmit(q.scenarios.incorrect.userAnswer, "incorrect");
  });

  // Khởi chạy tại Step 1
  goToStep(1);
});
