# Resume source

`resume.data.mjs` is the single source of truth. Both outputs are generated
from it, so the PDF and the DOCX can never drift apart.

```bash
cd resume-src
npm install          # docx + playwright, kept out of the site's dependencies
npm run build        # writes the PDF and the DOCX here
```

Then copy the PDF over the one the site serves:

```bash
cp Chadwick_Kraus_Resume_2026.pdf ../src/assets/files/
```

## Keeping it to two pages

Typography is tuned so the content fits two pages exactly — `FS` (font size)
and `LH` (line height) at the top of `build-pdf.mjs`, currently 9.0pt / 1.28.
The margin is thin. After adding content, check the page count rather than
assuming:

```bash
node -e "import('pypdf')" 2>/dev/null || python3 -c "
from pypdf import PdfReader
print(len(PdfReader('Chadwick_Kraus_Resume_2026.pdf').pages), 'pages')"
```

If it spills to three, prefer merging related bullets over shrinking the type
below 9pt — the previous version had 18 bullets under one role, which was both
too long and hard to read.
