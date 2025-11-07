import fitz
from pathlib import Path
pdf_path = Path('public/cv.pdf')
if not pdf_path.exists():
    raise SystemExit('cv.pdf missing')
doc = fitz.open(pdf_path)
preview_dir = Path('public')
for page_num in range(min(1, doc.page_count)):
    page = doc.load_page(page_num)
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
    out_path = preview_dir / f'cv_preview_{page_num+1}.png'
    pix.save(out_path)
print('saved preview to', out_path)
