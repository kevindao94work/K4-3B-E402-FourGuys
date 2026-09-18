const statusNames = {pass:'Đạt',fail:'Không đạt',error:'Lỗi thực thi',blocked:'Chưa chạy được'};
const checkNames = {
 no_premature_mastery:'Không xác nhận hiểu bài quá sớm',preserve_objective:'Giữ đúng mục tiêu',valid_live_citations:'Dẫn nguồn hợp lệ trong tài liệu hiện hành',specific_issue:'Xử lý đúng vấn đề cụ thể',grounding:'Bám sát căn cứ',learner_role:'Giữ vai trò học viên',next_step:'Bước tiếp theo phù hợp',source_outage_recovery:'Phục hồi khi mất nguồn'
};
export function vietnameseReport(metadata, results, summary, byCategory, failuresByCheck) {
 const failed=results.filter(r=>r.status!=='pass');
 const clean=s=>String(s).replaceAll('|','/').replaceAll('\n',' ');
 const percent=(summary.passRate*100).toFixed(1);
 const lines=[`# Kết quả đánh giá chatbot — ${metadata.runId}`,'',
 `**${summary.pass}/${summary.total} lượt đạt (${percent}%); ${summary.fail} lượt không đạt về hành vi; ${summary.error} lượt lỗi thực thi; ${summary.blocked} lượt chưa chạy được.**`,'',
 `Nguồn đang dùng: \`${metadata.sourceActual.pdf}\`. Số lần lặp mỗi ca: ${metadata.repeats}. Model giám khảo: \`${metadata.judgeModel}\`.`,
 '', metadata.replayOf ? `Đây là CHẤM LẠI phản hồi đã lưu từ \`${metadata.replayOf}\`, không gọi lại chatbot. Lỗi thực thi gốc được giữ nguyên.` : 'Đây là lượt gọi chatbot trực tiếp.',
 '', '## Tiêu chí đạt','',
 'Mỗi ca thông thường phải qua cả ba kiểm tra bằng mã (không xác nhận hiểu bài quá sớm, giữ mục tiêu, dẫn nguồn hợp lệ) và bốn kiểm tra ngữ nghĩa (xử lý đúng vấn đề, bám căn cứ, giữ vai trò học viên, có bước tiếp theo phù hợp). Một tiêu chí không đạt làm cả ca không đạt. Ca mất nguồn kiểm tra riêng việc thông báo rõ lỗi nguồn, hướng xử lý và không xác nhận hoàn thành.',
 '', 'Ngưỡng chẩn đoán: 100% lượt đã lên lịch phải đạt. Lỗi thực thi không được tính là đạt. Đây không phải ngưỡng nghiệm thu sản phẩm đã được nhóm phê duyệt.',
 '', '## Tổng hợp theo nhóm','', '| Nhóm | Đạt | Không đạt hành vi | Lỗi thực thi | Chưa chạy được |','|---|---:|---:|---:|---:|',
 ...Object.entries(byCategory).map(([k,s])=>`| ${k} | ${s.pass} | ${s.fail} | ${s.error} | ${s.blocked} |`),
 '', '## Số lần không đạt từng tiêu chí','',
 ...Object.entries(failuresByCheck).map(([k,n])=>`- ${checkNames[k]||k}: ${n}.`),
 '', 'Một lượt có thể trượt nhiều tiêu chí; không cộng các số này thành số ca lỗi độc lập.',
 '', '## Chi tiết các lượt chưa đạt','', '| Ca | Lần lặp | Kết quả | Nguyên nhân |','|---|---:|---|---|',
 ...failed.map(r=>`| ${r.id} | ${r.repeat} | ${statusNames[r.status]} | ${clean(r.reason||r.checks.filter(c=>!c.pass).map(c=>`${checkNames[c.name]||c.name}: ${c.reason}`).join('; '))} |`),
 '', '## Giới hạn diễn giải','',
 '- Đây là đánh giá phản hồi và trạng thái qua API; chưa kiểm tra badge/nút bấm hiển thị, thao tác mở dẫn nguồn hoặc toàn bộ hội thoại nhiều lượt.',
 '- Golden set vẫn tham chiếu Slide_Bai4_LLM_Generation_Params.pdf, khác tài liệu đang dùng. Chưa chấm độ đúng của số slide theo golden cũ; chưa có phê duyệt của con người cho golden set.',
 '- Kiểm tra ngữ nghĩa do model thực hiện và cần người rà soát; không coi đây là kết luận đã được giám khảo con người xác nhận.',
 '- Ca truth-08 chạy trên bản sao ứng dụng cục bộ đã bỏ Knowledge Map; không làm mất nguồn thật.',
 '- Kết quả chỉ phản ánh các lượt đã chạy. Các nhánh mới về Voice AI, Harness/Skills/MCP và API chưa có ca tương ứng trong golden set cũ.',
 '', '## Phản hồi thực tế',''];
 for(const r of results){lines.push(`### ${r.id} — lần ${r.repeat} — ${statusNames[r.status]}`,'',r.response||r.reason||'(Không có phản hồi văn bản.)','');}
 return lines.join('\n');
}
