// Builds the .docx from the same data file as the PDF.
import { writeFileSync } from 'node:fs';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, LevelFormat,
  PositionalTab, PositionalTabAlignment, PositionalTabRelativeTo,
  PositionalTabLeader,
} from 'docx';
import { resume as r } from './resume.data.mjs';

const PINE = '1E3A2B';
const FOREST = '2E5940';
const GREY = '555555';
const RULE = 'C8D5C8';

// Letter, 0.5in vertical / 0.55in horizontal margins (DXA: 1440 = 1in)
const PAGE = { width: 12240, height: 15840 };
const MARGIN = { top: 720, bottom: 720, left: 792, right: 792 };
const CONTENT_W = PAGE.width - MARGIN.left - MARGIN.right; // 10656
const SKILL_KEY_W = 2050;
const SKILL_VAL_W = CONTENT_W - SKILL_KEY_W;

const sectionHeading = (text) =>
  new Paragraph({
    spacing: { before: 200, after: 90 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 2 } },
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, size: 17, color: PINE, characterSpacing: 28 }),
    ],
  });

const body = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: opts.after ?? 70, line: 250 },
    alignment: opts.align,
    children: [new TextRun({ text, size: opts.size ?? 18, color: opts.color ?? '1C1C1C', bold: opts.bold })],
  });

// role on the left, dates flush right on the same line
const roleLine = (role, dates) =>
  new Paragraph({
    spacing: { before: 60, after: 10 },
    children: [
      new TextRun({ text: role, bold: true, size: 20 }),
      new TextRun({
        children: [
          new PositionalTab({
            alignment: PositionalTabAlignment.RIGHT,
            relativeTo: PositionalTabRelativeTo.MARGIN,
            leader: PositionalTabLeader.NONE,
          }),
        ],
      }),
      new TextRun({ text: dates, size: 17, color: GREY }),
    ],
  });

const bullet = (text) =>
  new Paragraph({
    numbering: { reference: 'resume-bullets', level: 0 },
    spacing: { after: 55, line: 250 },
    children: [new TextRun({ text, size: 18 })],
  });

const children = [
  new Paragraph({
    spacing: { after: 30 },
    children: [new TextRun({ text: r.name, bold: true, size: 40, color: PINE })],
  }),
  new Paragraph({
    spacing: { after: 30 },
    children: [new TextRun({ text: r.title, bold: true, size: 18, color: FOREST })],
  }),
  new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: r.contact.join('   ·   '), size: 17, color: GREY })],
  }),

  sectionHeading('Professional Summary'),
  body(r.summary, { align: AlignmentType.JUSTIFIED }),

  sectionHeading('Core Skills & Expertise'),
  new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [SKILL_KEY_W, SKILL_VAL_W],
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
    },
    rows: r.skills.map(
      ([k, v]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: SKILL_KEY_W, type: WidthType.DXA },
              margins: { top: 20, bottom: 20, right: 120 },
              children: [body(k, { bold: true, color: PINE, after: 0 })],
            }),
            new TableCell({
              width: { size: SKILL_VAL_W, type: WidthType.DXA },
              margins: { top: 20, bottom: 20 },
              children: [body(v, { after: 0 })],
            }),
          ],
        })
    ),
  }),

  sectionHeading('Work Experience'),
  ...r.experience.flatMap((j) => [
    roleLine(j.role, j.dates),
    body(j.org, { size: 17, color: FOREST, after: 60 }),
    ...j.bullets.map(bullet),
  ]),

  sectionHeading('Selected Projects'),
  body(r.projectsIntro, { size: 17, color: GREY, after: 90 }),
  ...r.projects.flatMap((p) => [
    new Paragraph({
      spacing: { before: 60, after: 10 },
      children: [
        new TextRun({ text: p.name, bold: true, size: 18 }),
        new TextRun({ text: ` — ${p.blurb}`, size: 18, color: GREY }),
      ],
    }),
    body(p.stack, { size: 16, color: FOREST, after: 20 }),
    body(p.text, { align: AlignmentType.JUSTIFIED, after: 80 }),
  ]),

  sectionHeading('Education & Certifications'),
  ...r.education.flatMap((e) => [
    new Paragraph({
      spacing: { before: 50, after: 10 },
      children: [
        new TextRun({ text: e.title, bold: true, size: 18 }),
        ...(e.org ? [new TextRun({ text: ` — ${e.org}`, size: 18, color: FOREST })] : []),
        new TextRun({
          children: [
            new PositionalTab({
              alignment: PositionalTabAlignment.RIGHT,
              relativeTo: PositionalTabRelativeTo.MARGIN,
              leader: PositionalTabLeader.NONE,
            }),
          ],
        }),
        new TextRun({ text: e.date, size: 17, color: GREY }),
      ],
    }),
    body(e.detail, { size: 17, color: GREY, after: 60 }),
  ]),
];

const doc = new Document({
  creator: r.name,
  title: `${r.name} — Resume`,
  styles: { default: { document: { run: { font: 'Helvetica Neue', size: 18 } } } },
  numbering: {
    config: [
      {
        reference: 'resume-bullets',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 260, hanging: 180 } } },
          },
        ],
      },
    ],
  },
  sections: [{ properties: { page: { size: PAGE, margin: MARGIN } }, children }],
});

const out = process.argv[2] || 'Chadwick_Kraus_Resume.docx';
const buf = await Packer.toBuffer(doc);
writeFileSync(out, buf);
console.log(`wrote ${out} (${(buf.length / 1024).toFixed(0)} KB)`);
