"""Rebuild the existing map schema from a local PDF and a reviewed private spec.
Requires PyMuPDF. Does not execute code or follow instructions found in the PDF.
"""
import argparse
import datetime
import hashlib
import json
import re
import shutil
from pathlib import Path
import fitz

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--pdf', type=Path, required=True)
parser.add_argument('--spec', type=Path, default=root / 'data/ingested/day01-tree-spec.json')
args = parser.parse_args()
source_bytes = args.pdf.read_bytes()
pdf = fitz.open(args.pdf)
pages = [' '.join(p.get_text().split()) for p in pdf]
spec = json.loads(args.spec.read_text())
if spec['source_sha256'] != hashlib.sha256(source_bytes).hexdigest():
    raise SystemExit('PDF differs from the reviewed source; review it and update the spec before regenerating.')
if spec['reviewed_pdf_pages'] != list(range(1, len(pdf) + 1)):
    raise SystemExit('The spec does not record review of every PDF page.')
units = spec['units']
problems = []

def evidence(page, wanted):
    text = pages[page - 1]
    positions = [i for i, ch in enumerate(text) if not ch.isspace()]
    compact = ''.join(text[i] for i in positions)
    needle = re.sub(r'\s+', '', wanted)
    start = compact.find(needle)
    if start < 0:
        problems.append(f'Page {page}: quote not found: {wanted}')
        quote = wanted
    else:
        quote = text[positions[start]:positions[start + len(needle) - 1] + 1]
    return {'type': 'slide', 'slide_id': f'd1-p{page:03}', 'pdf_page': page,
            'supporting_quote': quote, 'evidence_type': 'text', 'review_status': 'approved'}

out_units = []
for u in units:
    objectives = []
    for o in u['objectives']:
        claims = [{'id': f"{o['id']}-claim-{i}", 'text': text, 'evidence': [evidence(page, quote)]}
                  for i, (text, page, quote) in enumerate(o['claims'], 1)]
        objectives.append({'id': o['id'], 'title': o['title'], 'required_claims': claims,
                           'common_misconceptions': [{'id': f"{o['id']}-misconception-{i}", 'text': text, 'severity': 'core'}
                                                    for i, text in enumerate(o['misconceptions'], 1)]})
    slide_ids = sorted({e['slide_id'] for o in objectives for c in o['required_claims'] for e in c['evidence']})
    out_units.append({'id': u['id'], 'title': u['title'], 'slide_ids': slide_ids,
                      'status': 'source_reviewed', 'objectives': objectives,
                      'dependencies': [[a['id'], b['id']] for a, b in zip(objectives, objectives[1:])]})
if problems:
    raise SystemExit('\n'.join(problems))

learning_pages = sorted({e['pdf_page'] for u in out_units for o in u['objectives'] for c in o['required_claims'] for e in c['evidence']})
excluded = {
  1:'Bìa', 2:'Câu hỏi khởi động', 3:'Mục lục', 4:'Trang phân chương', 5:'Mục tiêu tổng quan',
  19:'Trang phân chương', 28:'Trang phân chương', 35:'Trang phân chương', 44:'Trang phân chương',
  50:'Danh mục tài liệu tham khảo', 51:'Hỏi đáp', 52:'Kết thúc'
}
if set(learning_pages) | set(excluded) != set(range(1, len(pdf)+1)):
    raise SystemExit('Some PDF pages have not been classified')
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
map_data = {
 'schema_version':'1.0', 'lesson_id':'day01-llm-foundation-1', 'title':'AI & LLM Foundation',
 'source':{'pdf':'data/slides/day01-llm-foundation-1.pdf','slide_index':'data/ingested/d1-slide-index.md',
           'page_count':len(pdf),'sha256':hashlib.sha256(source_bytes).hexdigest(),'generated_at':now,
           'generation_method':'PDF text extraction + visual source review + curated claims; existing schema',
           'review':{'reviewer':'Codex','method':'All 52 pages rendered and visually inspected; each quote matched to extracted page text.',
                     'human_review_status':'not_requested',
                     'meaning_of_approved':'Source fidelity checked for this local app; not human approval of the golden set or verification of current external facts.'}},
 'scope':{'metadata_pages':[f'd1-p{i:03}' for i in excluded],
          'learning_pages':[f'd1-p{i:03}' for i in learning_pages],
          'excluded_pages':{f'd1-p{i:03}':reason for i,reason in excluded.items()},
          'note':'Dẫn nguồn dùng vị trí trang PDF (1–52), không dùng số chân trang (1–42, có số lặp). Giá, số liệu, SDK là ví dụ theo tài liệu tháng 3/2026.'},
 'learning_units':out_units,
 'cross_unit_dependencies':[[a['id'],b['id']] for a,b in zip(out_units,out_units[1:])],
 'review_queue':[
  'Trang PDF 17 ghi Perceptron 1957, trang 21 ghi 1958; không dùng năm này làm tiêu chí chấm.',
  'Trang 22 gộp BERT vào Encoder-Decoder; cây chỉ dùng các thành phần Transformer đã đối chiếu, không dùng phân loại này làm tiêu chí chấm.',
  'Trang 25/40 dùng diễn đạt đơn giản temperature=0 deterministic; không suy ra bảo đảm đúng sự thật hoặc JSON.',
  'Giá, context, tốc độ, tỷ lệ ROI và cú pháp SDK là ví dụ lịch sử trong slide; chưa xác minh tính cập nhật bên ngoài.',
  'Nguồn mới không chứa công thức temperature scaling hoặc diễn giải chi tiết random seed; bộ golden cũ vẫn cần đối chiếu riêng.'
 ]}
archive=root/'data/ingested/archive/d1-slide-hackathon'
archive.mkdir(parents=True,exist_ok=True)
for name in ['d1-knowledge-map.json','d1-slide-index.md']:
    current=root/'data/ingested'/name
    backup=archive/name
    if current.exists() and not backup.exists(): shutil.copy2(current,backup)
index=['# Chỉ mục slide — AI & LLM Foundation', '',f'Nguồn: `{map_data["source"]["pdf"]}`',
       'Số trang dưới đây là vị trí trang PDF, không phải số in ở chân slide.', '']
for i,text in enumerate(pages,1):
    index.extend([f'## [d1-p{i:03}] Trang PDF {i}', '',text,''])
(root/'data/ingested/d1-slide-index.md').write_text('\n'.join(index))
(root/'data/ingested/d1-knowledge-map.json').write_text(json.dumps(map_data,ensure_ascii=False,indent=2)+'\n')
# Store the PDF after successful generation so source links and map refer to the same bytes.
destination=root/map_data['source']['pdf']
destination.parent.mkdir(parents=True,exist_ok=True)
if args.pdf.resolve()!=destination.resolve(): shutil.copy2(args.pdf,destination)
lines=['# Cây kiến thức từ day01-llm-foundation-1.pdf','',
       'Cấu trúc giữ như bản cũ: nhóm → mục tiêu → ý bắt buộc → ngộ nhận → dẫn chứng. Câu hỏi hội thoại được AI tạo khi chọn mục tiêu, không lưu cố định trong cây.', '']
for u in out_units:
    lines.extend([f'## {u["title"]}',''])
    for o in u['objectives']:
        ps=sorted({e['pdf_page'] for c in o['required_claims'] for e in c['evidence']})
        lines.extend([f'### {o["title"]}',f'ID: `{o["id"]}` · Trang PDF: '+', '.join(map(str,ps)),''])
        lines.extend(['- '+c['text'] for c in o['required_claims']]);lines.append('')
        lines.extend(['Ngộ nhận cần kiểm tra: '+m['text'] for m in o['common_misconceptions']]);lines.append('')
(root/'data/ingested/day01-question-tree.md').write_text('\n'.join(lines))
print(f'Generated {len(out_units)} units, {sum(len(u["objectives"]) for u in out_units)} objectives, {sum(len(o["required_claims"]) for u in out_units for o in u["objectives"])} claims; {len(learning_pages)} content pages out of {len(pdf)} PDF pages.')
