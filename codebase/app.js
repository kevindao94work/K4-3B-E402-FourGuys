/**
 * ExplainLab - Prototype tương tác Track D3: Học bằng cách dạy
 * Bài Lab AI20k - Giai đoạn CP2 (CheckPoint 2)
 * Theme: Clean Slate Minimalist (Không icon thừa, không gradient)
 */

// ==========================================
// DỮ LIỆU MOCK THEO CHỦ ĐỀ VÀ TÌNH HUỐNG DEMO
// ==========================================

const TOPICS = {
  react: {
    id: "react",
    name: "ReAct",
    subtitle: "Reasoning & Acting trong LLM",
    tag: "Agent Architecture",
    level: "Trung bình",
    description: "Khung kiến trúc kết hợp giữa việc suy nghĩ từng bước (Reasoning) và thực hiện hành động gọi công cụ bên ngoài (Acting) cho mô hình ngôn ngữ lớn.",
    starterHint: "Khái niệm này dùng để giúp mô hình ngôn ngữ vừa có thể tự lập luận suy nghĩ (Reasoning), vừa biết tự gọi công cụ bên ngoài (Acting) để giải quyết vấn đề...",
    samples: {
      gap: "ReAct là kỹ thuật kết hợp Reasoning và Acting. Nó giúp LLM suy nghĩ ra các bước rồi quyết định hành động gì tiếp theo, tránh việc mô hình trả lời bừa.",
      positive: "ReAct là mô hình kết hợp chặt chẽ giữa Reasoning (suy luận) và Acting (hành động). Trong quy trình này, mô hình trải qua chuỗi vòng lặp Thought -> Action -> Observation: đầu tiên nó suy nghĩ về bài toán, sau đó quyết định gọi một công cụ bên ngoài như tra cứu dữ liệu hay máy tính, rồi quan sát kết quả trả về để tiếp tục suy luận cho đến khi tìm ra câu trả lời chính xác.",
      insufficient: "ReAct là một cách để ra lệnh cho AI làm việc."
    },
    feedbacks: {
      gap: {
        score: 72,
        badgeText: "Còn một vài lỗ hổng — hãy thử giải thích lại",
        badgeClass: "status-gap",
        summary: "Bạn đã nắm được ý tưởng cốt lõi kết hợp giữa suy nghĩ và hành động, nhưng còn thiếu cơ chế cập nhật thông tin để tạo thành vòng lặp khép kín.",
        goodPoints: [
          "Đã giải thích đúng bản chất ReAct là sự phối hợp giữa hai thành tố: Reasoning (suy luận) và Acting (hành động).",
          "Nêu rõ được mục đích tích cực là giúp mô hình lập kế hoạch trước thay vì dự đoán từ ngữ một cách vội vã."
        ],
        gapPoints: [
          "Chưa nhắc đến bước Quan sát (Observation) - cách mô hình tiếp nhận kết quả trả về từ công cụ để suy nghĩ tiếp.",
          "Chưa đưa ra ví dụ cụ thể về công cụ mà mô hình có thể gọi (như Web Search, Máy tính, API nội bộ)."
        ],
        guidingQuestion: "Sau khi mô hình thực hiện một Action (ví dụ: tra cứu dữ liệu), bước tiếp theo là gì để mô hình biết được kết quả đó và đưa ra câu trả lời cuối cùng?"
      },
      positive: {
        score: 92,
        badgeText: "Giải thích rất tốt — Đầy đủ & rõ ràng",
        badgeClass: "status-positive",
        summary: "Bạn đã giải thích khá đầy đủ. Lời giải thích rất mạch lạc, bám sát vòng lặp và phù hợp để người mới tiếp cận.",
        goodPoints: [
          "Mô tả chính xác chu kỳ 3 bước kinh điển của ReAct: Thought (Suy nghĩ) → Action (Hành động) → Observation (Quan sát).",
          "Lấy ví dụ cụ thể về việc mô hình tương tác với công cụ bên ngoài nhằm hạn chế ảo giác (hallucination)."
        ],
        gapPoints: [
          "Có thể phân tích thêm ưu điểm của ReAct so với Chain-of-Thought (CoT) truyền thống khi gặp bài toán cần dữ liệu thời gian thực.",
          "Có thể bổ sung kịch bản xử lý khi công cụ gọi lỗi hoặc không tìm thấy dữ liệu mong muốn."
        ],
        guidingQuestion: "Nếu một Action bị lỗi hoặc không tìm thấy kết quả, vòng lặp ReAct sẽ hỗ trợ mô hình tự điều chỉnh hướng suy nghĩ tiếp theo ra sao?"
      },
      insufficient: {
        score: 35,
        badgeText: "Chưa đủ thông tin — Cần bổ sung chi tiết",
        badgeClass: "status-insufficient",
        summary: "Chưa thể đánh giá chắc chắn. Lời giải thích quá ngắn và chưa nêu được cơ chế hoạt động đặc trưng của ReAct.",
        goodPoints: [
          "Bước đầu nhận diện được ReAct là một phương pháp liên quan đến việc điều khiển mô hình AI.",
          "Ý thức được mục tiêu muốn hướng dẫn mô hình thực hiện nhiệm vụ."
        ],
        gapPoints: [
          "Chưa giải thích tên gọi ReAct viết tắt của hai từ gì và chúng kết hợp với nhau như thế nào.",
          "Hoàn toàn thiếu quy trình hoạt động hoặc ví dụ minh họa công cụ bên ngoài."
        ],
        guidingQuestion: "Bạn có thể định nghĩa ReAct là viết tắt của những từ nào và cho một ví dụ đơn giản mà nếu không có công cụ bên ngoài thì AI sẽ bó tay không?"
      }
    }
  },

  "prompt-engineering": {
    id: "prompt-engineering",
    name: "Prompt Engineering",
    subtitle: "Kỹ thuật thiết kế & tối ưu câu lệnh",
    tag: "Prompt Design",
    level: "Cơ bản",
    description: "Phương pháp thiết kế, tinh chỉnh câu lệnh đầu vào để mô hình ngôn ngữ lớn hiểu đúng ngữ cảnh và tạo ra phản hồi chính xác, tối ưu nhất.",
    starterHint: "Khái niệm này dùng để hướng dẫn và định hình câu trả lời của AI thông qua việc xây dựng cấu trúc prompt rõ ràng...",
    samples: {
      gap: "Prompt Engineering là cách viết câu lệnh cho AI. Nếu bạn viết chi tiết và cho vai trò rõ ràng thì AI sẽ trả lời hay hơn.",
      positive: "Prompt Engineering là nghệ thuật và kỹ thuật thiết kế câu lệnh đầu vào nhằm giúp mô hình AI hiểu chính xác mục tiêu và đưa ra phản hồi tốt nhất. Kỹ thuật này bao gồm việc chỉ định rõ: vai trò (Role), bối cảnh (Context), nhiệm vụ cụ thể (Instruction), định dạng mong muốn (Format) và có thể kèm theo vài ví dụ mẫu (Few-shot prompting).",
      insufficient: "Prompt engineering là việc gõ prompt vào ChatGPT."
    },
    feedbacks: {
      gap: {
        score: 74,
        badgeText: "Còn một vài lỗ hổng — hãy thử giải thích lại",
        badgeClass: "status-gap",
        summary: "Bạn đã nắm được ý cơ bản về việc đặt vai trò và chi tiết, nhưng chưa làm rõ các kỹ thuật phổ biến và cấu trúc câu lệnh chuẩn.",
        goodPoints: [
          "Hiểu được tầm quan trọng của việc gán vai trò (Role persona) cho mô hình.",
          "Diễn đạt gần gũi, giúp người mới hình dung việc ra lệnh cần có sự chi tiết."
        ],
        gapPoints: [
          "Chưa nêu các kỹ thuật tiêu biểu như Few-shot prompting, Chain-of-Thought hay ràng buộc định dạng (Output constraints).",
          "Chưa phân biệt được sự khác nhau giữa một prompt mơ hồ và một prompt có cấu trúc ngữ cảnh chặt chẽ."
        ],
        guidingQuestion: "Ngoài việc bảo AI đóng vai một chuyên gia, bạn sẽ bổ sung thêm những yếu tố nào (như ví dụ mẫu hay định dạng đầu ra) để kết quả không bị lệch hướng?"
      },
      positive: {
        score: 95,
        badgeText: "Giải thích rất tốt — Đầy đủ & rõ ràng",
        badgeClass: "status-positive",
        summary: "Bạn đã giải thích khá đầy đủ. Cấu trúc câu lệnh được bạn chia nhỏ rất sư phạm và dễ áp dụng thực tế.",
        goodPoints: [
          "Nêu rõ các thành phần cốt lõi của một prompt tốt: Role, Context, Task, Constraints, và Output Format.",
          "Đề cập đến phương pháp học qua ví dụ (Few-shot prompting) giúp mô hình nắm bắt phong cách và chuẩn mực dữ liệu."
        ],
        gapPoints: [
          "Có thể đề cập thêm về rủi ro Prompt Injection và cách phòng ngừa khi đưa ứng dụng vào môi trường sản xuất thực tế.",
          "Có thể nhắc đến việc lặp lại (Iterative refinement) khi tối ưu prompt qua nhiều lượt thử nghiệm."
        ],
        guidingQuestion: "Làm thế nào để bạn đo lường xem một prompt sau khi tinh chỉnh thực sự tốt hơn phiên bản cũ một cách khách quan?"
      },
      insufficient: {
        score: 30,
        badgeText: "Chưa đủ thông tin — Cần bổ sung chi tiết",
        badgeClass: "status-insufficient",
        summary: "Chưa thể đánh giá chắc chắn. Câu trả lời quá ngắn gọn và chưa làm nổi bật tính chất kỹ thuật của Prompt Engineering.",
        goodPoints: [
          "Xác định đúng đối tượng làm việc là tương tác với AI thông qua câu lệnh.",
          "Dùng từ ngữ quen thuộc với người dùng phổ thông."
        ],
        gapPoints: [
          "Chưa giải thích tại sao gọi là 'Engineering' (kỹ nghệ) thay vì chỉ là việc gõ chữ thông thường.",
          "Thiếu các nguyên tắc cơ bản như cung cấp ngữ cảnh, cấu trúc dữ liệu hoặc ví dụ minh họa."
        ],
        guidingQuestion: "Nếu một người bạn nói 'cứ gõ đại một câu vào AI là xong, việc gì phải học Prompt Engineering', bạn sẽ đưa ra ví dụ gì để thuyết phục bạn ấy?"
      }
    }
  },

  rag: {
    id: "rag",
    name: "RAG",
    subtitle: "Retrieval-Augmented Generation",
    tag: "Retrieval & Generation",
    level: "Trung bình",
    description: "Kỹ thuật kết hợp giữa truy xuất tài liệu từ nguồn tri thức bên ngoài và khả năng tổng hợp của mô hình ngôn ngữ lớn để trả lời chính xác, giảm ảo giác.",
    starterHint: "Khái niệm này dùng để giải quyết vấn đề mô hình AI bị lỗi thời kiến thức hoặc nói dối bằng cách tra cứu tài liệu trước khi trả lời...",
    samples: {
      gap: "RAG là viết tắt của Retrieval-Augmented Generation. Khi người dùng hỏi, hệ thống sẽ tìm kiếm thông tin liên quan trong kho dữ liệu rồi đưa vào cho AI trả lời để không bị bịa chuyện.",
      positive: "RAG (Retrieval-Augmented Generation) là giải pháp kết hợp giữa tìm kiếm tài liệu (Retrieval) và tạo sinh văn bản (Generation). Khi có câu hỏi, hệ thống chuyển câu hỏi thành vector embedding, tìm các đoạn văn bản liên quan nhất từ cơ sở dữ liệu Vector DB, sau đó ghép chúng vào Prompt làm ngữ cảnh thực tế cho LLM sinh câu trả lời chính xác và có trích dẫn nguồn.",
      insufficient: "RAG là cách giúp AI có thêm kiến thức mới."
    },
    feedbacks: {
      gap: {
        score: 70,
        badgeText: "Còn một vài lỗ hổng — hãy thử giải thích lại",
        badgeClass: "status-gap",
        summary: "Bạn đã hiểu đúng bản chất là tra cứu dữ liệu rồi mới trả lời, nhưng còn thiếu giai đoạn xử lý dữ liệu và cách liên kết kỹ thuật.",
        goodPoints: [
          "Nêu đúng mục đích quan trọng nhất của RAG: giảm thiểu ảo giác (hallucination) và tận dụng dữ liệu riêng.",
          "Chỉ ra được luồng cơ bản gồm 2 bước: tìm thông tin rồi mới gửi cho AI sinh câu trả lời."
        ],
        gapPoints: [
          "Chưa nhắc đến khái niệm Chunking (chia nhỏ văn bản) và Vector Embedding dùng để tìm kiếm ngữ nghĩa.",
          "Chưa làm rõ việc đưa ngữ cảnh tìm được vào đâu (nhúng vào prompt) trước khi chuyển cho LLM."
        ],
        guidingQuestion: "Làm cách nào hệ thống biết được đoạn tài liệu nào là phù hợp nhất với câu hỏi của người dùng để trích xuất ra?"
      },
      positive: {
        score: 96,
        badgeText: "Giải thích rất tốt — Đầy đủ & rõ ràng",
        badgeClass: "status-positive",
        summary: "Bạn đã giải thích khá đầy đủ. Các thuật ngữ kỹ thuật như Vector DB, Embedding và Context Injection được kết nối rất chính xác.",
        goodPoints: [
          "Giải thích chi tiết 2 khâu Retrieval (Vector search) và Generation (LLM synthesis) cực kỳ khoa học.",
          "Nhấn mạnh được giá trị thực tiễn: trích dẫn được nguồn gốc thông tin và cập nhật dữ liệu mà không cần fine-tune lại mô hình."
        ],
        gapPoints: [
          "Có thể đào sâu thêm về các kỹ thuật nâng cao như Re-ranking hoặc HyDE để tăng độ chính xác truy xuất.",
          "Có thể nhắc đến cách xử lý khi văn bản truy xuất chứa thông tin mâu thuẫn lẫn nhau."
        ],
        guidingQuestion: "Nếu kho tài liệu có nhiều văn bản cũ và mới chứa thông tin trái ngược nhau, hệ thống RAG nên xử lý bước Retrieval và Prompting như thế nào?"
      },
      insufficient: {
        score: 32,
        badgeText: "Chưa đủ thông tin — Cần bổ sung chi tiết",
        badgeClass: "status-insufficient",
        summary: "Chưa thể đánh giá chắc chắn. Bạn mới chỉ nêu được mục tiêu khái quát nhưng chưa giải thích cách RAG vận hành.",
        goodPoints: [
          "Nhận biết được vai trò của RAG trong việc mở rộng vốn tri thức cho AI.",
          "Nắm bắt được nhu cầu cần thông tin mới của các ứng dụng thông minh."
        ],
        gapPoints: [
          "Chưa giải thích RAG là viết tắt của những chữ nào.",
          "Chưa nêu được quy trình tìm kiếm tài liệu bên ngoài và đưa vào câu lệnh trước khi trả lời."
        ],
        guidingQuestion: "Bạn có thể giải thích RAG viết tắt của từ gì và 2 bước chính diễn ra khi người dùng hỏi một câu trong hệ thống này không?"
      }
    }
  }
};

// ==========================================
// TRẠNG THÁI ỨNG DỤNG (APPLICATION STATE)
// ==========================================

const state = {
  currentStep: 1,
  selectedTopicId: "react",
  explanationText: "",
  selectedScenario: "gap" // 'gap' | 'positive' | 'insufficient'
};

// ==========================================
// DOM ELEMENTS SELECTOR CACHE
// ==========================================

let dom = {};

function initDomElements() {
  dom = {
    // Stepper
    stepperItems: document.querySelectorAll(".step-item"),
    stepperTrackFill: document.getElementById("stepperTrackFill"),

    // Screens
    screens: {
      1: document.getElementById("screen1"),
      2: document.getElementById("screen2"),
      3: document.getElementById("screen3")
    },

    // Global Controls
    scenarioSelect: document.getElementById("scenarioSelect"),
    btnResetApp: document.getElementById("btnResetApp"),

    // Screen 1 Elements
    topicCards: document.querySelectorAll(".topic-card"),
    btnStartExplain: document.getElementById("btnStartExplain"),

    // Screen 2 Elements
    topicBadgeTitle: document.getElementById("topicBadgeTitle"),
    topicBadgeTag: document.getElementById("topicBadgeTag"),
    starterHintText: document.getElementById("starterHintText"),
    btnUseHint: document.getElementById("btnUseHint"),
    btnFillSample: document.getElementById("btnFillSample"),
    btnClearText: document.getElementById("btnClearText"),
    explanationTextarea: document.getElementById("explanationTextarea"),
    charCount: document.getElementById("charCount"),
    inlineAlert: document.getElementById("inlineAlert"),
    inlineAlertMsg: document.getElementById("inlineAlertMsg"),
    btnBackToTopic: document.getElementById("btnBackToTopic"),
    btnSubmitExplain: document.getElementById("btnSubmitExplain"),

    // Screen 3 Elements
    feedbackScoreNum: document.getElementById("feedbackScoreNum"),
    feedbackTopicLabel: document.getElementById("feedbackTopicLabel"),
    feedbackStatusBadge: document.getElementById("feedbackStatusBadge"),
    feedbackSummary: document.getElementById("feedbackSummary"),
    listGoodPoints: document.getElementById("listGoodPoints"),
    listGapPoints: document.getElementById("listGapPoints"),
    questionBoxText: document.getElementById("questionBoxText"),
    btnReviewToggle: document.getElementById("btnReviewToggle"),
    reviewToggleIcon: document.getElementById("reviewToggleIcon"),
    reviewContent: document.getElementById("reviewContent"),
    btnEditExplain: document.getElementById("btnEditExplain"),
    btnChangeTopic: document.getElementById("btnChangeTopic"),

    // Loading overlay
    loadingOverlay: document.getElementById("loadingOverlay")
  };
}

// ==========================================
// NAVIGATION & STEP LOGIC
// ==========================================

function goToStep(stepNumber) {
  state.currentStep = stepNumber;

  // Cập nhật Stepper
  dom.stepperItems.forEach((item) => {
    const step = parseInt(item.dataset.step, 10);
    item.classList.remove("active", "completed");
    if (step < stepNumber) {
      item.classList.add("completed");
    } else if (step === stepNumber) {
      item.classList.add("active");
    }
  });

  // Cập nhật thanh nối %
  if (dom.stepperTrackFill) {
    const percentage = stepNumber === 1 ? 0 : stepNumber === 2 ? 50 : 100;
    dom.stepperTrackFill.style.width = `${percentage}%`;
  }

  // Chuyển màn hình
  Object.keys(dom.screens).forEach((key) => {
    const screenEl = dom.screens[key];
    if (parseInt(key, 10) === stepNumber) {
      screenEl.classList.add("active");
    } else {
      screenEl.classList.remove("active");
    }
  });

  // Cấu hình riêng cho từng màn hình
  if (stepNumber === 2) {
    setupScreen2();
  } else if (stepNumber === 3) {
    renderFeedbackScreen();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==========================================
// SCREEN 1 LOGIC: CHỌN CHỦ ĐỀ
// ==========================================

function selectTopic(topicId) {
  if (!TOPICS[topicId]) return;
  state.selectedTopicId = topicId;

  dom.topicCards.forEach((card) => {
    if (card.dataset.topic === topicId) {
      card.classList.add("selected");
    } else {
      card.classList.remove("selected");
    }
  });
}

// ==========================================
// SCREEN 2 LOGIC: NHẬP LỜI GIẢI THÍCH
// ==========================================

function setupScreen2() {
  const currentTopic = TOPICS[state.selectedTopicId] || TOPICS.react;

  // Cập nhật nhãn chủ đề
  if (dom.topicBadgeTitle) dom.topicBadgeTitle.textContent = currentTopic.name;
  if (dom.topicBadgeTag) dom.topicBadgeTag.textContent = currentTopic.tag;

  // Cập nhật gợi ý mở đầu
  if (dom.starterHintText) dom.starterHintText.textContent = currentTopic.starterHint;

  // Giữ nguyên nội dung cũ nếu đã có
  dom.explanationTextarea.value = state.explanationText;
  updateCharCounter();
  hideError();

  setTimeout(() => {
    dom.explanationTextarea.focus();
  }, 100);
}

function updateCharCounter() {
  const text = dom.explanationTextarea.value;
  const count = text.length;
  dom.charCount.textContent = `${count} ký tự`;

  if (count > 0) {
    dom.charCount.classList.add("active");
  } else {
    dom.charCount.classList.remove("active");
  }
}

function showError(message) {
  dom.inlineAlertMsg.textContent = message;
  dom.inlineAlert.classList.add("visible");
  dom.explanationTextarea.classList.add("has-error");
}

function hideError() {
  dom.inlineAlert.classList.remove("visible");
  dom.explanationTextarea.classList.remove("has-error");
}

function handleUseHint() {
  const currentTopic = TOPICS[state.selectedTopicId];
  if (!currentTopic) return;

  const currentVal = dom.explanationTextarea.value.trim();
  if (currentVal.length === 0) {
    dom.explanationTextarea.value = currentTopic.starterHint + " ";
  } else {
    dom.explanationTextarea.value += " " + currentTopic.starterHint + " ";
  }
  updateCharCounter();
  hideError();
  dom.explanationTextarea.focus();
}

function handleFillSample() {
  const currentTopic = TOPICS[state.selectedTopicId];
  if (!currentTopic) return;

  const sample = currentTopic.samples[state.selectedScenario] || currentTopic.samples.gap;
  dom.explanationTextarea.value = sample;
  updateCharCounter();
  hideError();
  dom.explanationTextarea.focus();
}

function handleClearText() {
  dom.explanationTextarea.value = "";
  updateCharCounter();
  hideError();
  dom.explanationTextarea.focus();
}

function submitExplanation() {
  const content = dom.explanationTextarea.value.trim();

  // Kiểm tra textarea rỗng
  if (!content) {
    showError("Vui lòng nhập phần giải thích của bạn trước khi gửi để nhận phản hồi.");
    return;
  }

  // Lưu lại nội dung
  state.explanationText = dom.explanationTextarea.value;
  hideError();

  // Loading giả lập 500ms
  showLoadingModal();
  setTimeout(() => {
    hideLoadingModal();
    goToStep(3);
  }, 500);
}

function showLoadingModal() {
  if (dom.loadingOverlay) {
    dom.loadingOverlay.classList.add("visible");
  }
}

function hideLoadingModal() {
  if (dom.loadingOverlay) {
    dom.loadingOverlay.classList.remove("visible");
  }
}

// ==========================================
// SCREEN 3 LOGIC: PHẢN HỒI (MOCK RESULTS)
// ==========================================

function renderFeedbackScreen() {
  const currentTopic = TOPICS[state.selectedTopicId] || TOPICS.react;
  const scenarioKey = state.selectedScenario || "gap";
  const feedbackData = currentTopic.feedbacks[scenarioKey] || currentTopic.feedbacks.gap;

  // 1. Điểm số
  dom.feedbackScoreNum.textContent = feedbackData.score;

  // 2. Nhãn chủ đề và badge trạng thái
  dom.feedbackTopicLabel.textContent = `Chủ đề: ${currentTopic.name}`;
  dom.feedbackStatusBadge.textContent = feedbackData.badgeText;
  dom.feedbackStatusBadge.className = `status-badge ${feedbackData.badgeClass}`;
  dom.feedbackSummary.textContent = feedbackData.summary;

  // 3. Render "Bạn đã làm tốt" (2 ý)
  dom.listGoodPoints.innerHTML = "";
  feedbackData.goodPoints.forEach((point) => {
    const li = document.createElement("li");
    li.className = "feedback-list-item";
    li.innerHTML = `
      <span class="item-dash">—</span>
      <div>${escapeHTML(point)}</div>
    `;
    dom.listGoodPoints.appendChild(li);
  });

  // 4. Render "Có thể bổ sung" (2 lỗ hổng)
  dom.listGapPoints.innerHTML = "";
  feedbackData.gapPoints.forEach((point) => {
    const li = document.createElement("li");
    li.className = "feedback-list-item";
    li.innerHTML = `
      <span class="item-dash">—</span>
      <div>${escapeHTML(point)}</div>
    `;
    dom.listGapPoints.appendChild(li);
  });

  // 5. Render "Câu hỏi để bạn tự sửa"
  dom.questionBoxText.textContent = feedbackData.guidingQuestion;

  // 6. Hiển thị bài viết của học viên
  dom.reviewContent.textContent = state.explanationText;
  dom.reviewContent.classList.remove("open");
  dom.reviewToggleIcon.textContent = "▼";
}

function toggleReviewContent() {
  const isOpen = dom.reviewContent.classList.contains("open");
  if (isOpen) {
    dom.reviewContent.classList.remove("open");
    dom.reviewToggleIcon.textContent = "▼";
  } else {
    dom.reviewContent.classList.add("open");
    dom.reviewToggleIcon.textContent = "▲";
  }
}

// ==========================================
// SCENARIO SWITCHER & RESET
// ==========================================

function handleScenarioChange(e) {
  const newScenario = e.target.value;
  state.selectedScenario = newScenario;

  if (state.currentStep === 3) {
    renderFeedbackScreen();
  }
}

function handleResetApp() {
  state.currentStep = 1;
  state.selectedTopicId = "react";
  state.explanationText = "";
  state.selectedScenario = "gap";

  if (dom.scenarioSelect) {
    dom.scenarioSelect.value = "gap";
  }
  selectTopic("react");
  if (dom.explanationTextarea) {
    dom.explanationTextarea.value = "";
    updateCharCounter();
    hideError();
  }
  goToStep(1);
}

// Helper tránh XSS
function escapeHTML(str) {
  const p = document.createElement("p");
  p.appendChild(document.createTextNode(str));
  return p.innerHTML;
}

// ==========================================
// SỰ KIỆN KHỞI TẠO (EVENT LISTENERS)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  initDomElements();

  // 1. Topic Card selection
  dom.topicCards.forEach((card) => {
    card.addEventListener("click", () => {
      selectTopic(card.dataset.topic);
    });
  });

  // 2. Start explanation button
  dom.btnStartExplain.addEventListener("click", () => {
    goToStep(2);
  });

  // 3. Screen 2 controls
  dom.explanationTextarea.addEventListener("input", () => {
    updateCharCounter();
    if (dom.explanationTextarea.value.trim().length > 0) {
      hideError();
    }
  });

  dom.btnUseHint.addEventListener("click", handleUseHint);
  dom.btnFillSample.addEventListener("click", handleFillSample);
  dom.btnClearText.addEventListener("click", handleClearText);
  dom.btnBackToTopic.addEventListener("click", () => goToStep(1));
  dom.btnSubmitExplain.addEventListener("click", submitExplanation);

  // 4. Screen 3 controls
  dom.btnReviewToggle.addEventListener("click", toggleReviewContent);
  dom.btnEditExplain.addEventListener("click", () => {
    goToStep(2);
  });
  dom.btnChangeTopic.addEventListener("click", () => {
    goToStep(1);
  });

  // 5. Global demo scenario switcher & Reset
  dom.scenarioSelect.addEventListener("change", handleScenarioChange);
  dom.btnResetApp.addEventListener("click", handleResetApp);

  // Khởi động tại Bước 1
  selectTopic("react");
  goToStep(1);
});
