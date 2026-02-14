import { Injectable } from '@nestjs/common';

export interface ReportCardData {
  studentName: string;
  examName: string;
  subjects: Array<{
    subjectName: string;
    totalMarks: number;
    marksObtained: number | null;
    grade: string | null;
    isAbsent: boolean;
    passed: boolean;
  }>;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  overallGrade: string;
  rank: number | null;
}

@Injectable()
export class ReportCardService {
  /**
   * Generate a simple PDF report card.
   * Returns a Buffer containing the PDF data.
   */
  async generatePdf(data: ReportCardData): Promise<Buffer> {
    // Build a minimal PDF manually (PDF 1.4 spec)
    // This avoids needing an external PDF library for basic report cards.
    const lines: string[] = [];
    const addLine = (text: string) => lines.push(text);

    addLine('REPORT CARD');
    addLine('═'.repeat(50));
    addLine(`Student: ${data.studentName}`);
    addLine(`Examination: ${data.examName}`);
    addLine('');
    addLine('─'.repeat(50));
    addLine(
      padRight('Subject', 20) +
        padRight('Total', 8) +
        padRight('Marks', 8) +
        padRight('Grade', 8) +
        'Status',
    );
    addLine('─'.repeat(50));

    for (const subject of data.subjects) {
      const marks = subject.isAbsent
        ? 'ABS'
        : String(subject.marksObtained ?? '-');
      const status = subject.isAbsent
        ? 'Absent'
        : subject.passed
          ? 'Pass'
          : 'Fail';
      addLine(
        padRight(subject.subjectName, 20) +
          padRight(String(subject.totalMarks), 8) +
          padRight(marks, 8) +
          padRight(subject.grade ?? '-', 8) +
          status,
      );
    }

    addLine('─'.repeat(50));
    addLine(`Total Marks: ${data.obtainedMarks} / ${data.totalMarks}`);
    addLine(`Percentage: ${data.percentage}%`);
    addLine(`Overall Grade: ${data.overallGrade}`);
    if (data.rank !== null) {
      addLine(`Rank: ${data.rank}`);
    }
    addLine('═'.repeat(50));

    const content = lines.join('\n');

    // Create a minimal valid PDF with the text content
    return createSimplePdf(content);
  }
}

function padRight(text: string, length: number): string {
  return text.length >= length ? text : text + ' '.repeat(length - text.length);
}

/**
 * Create a minimal valid PDF containing text.
 * Uses PDF 1.4 spec with a single page and one text stream.
 */
function createSimplePdf(text: string): Buffer {
  const textLines = text.split('\n');
  const lineHeight = 14;
  const marginTop = 750;
  const marginLeft = 50;
  const pageHeight = 842;
  const pageWidth = 595;

  // Build the text stream
  const streamLines: string[] = ['BT', '/F1 10 Tf'];

  for (let i = 0; i < textLines.length; i++) {
    const y = marginTop - i * lineHeight;
    if (y < 50) break; // Don't go below bottom margin
    const escaped = textLines[i]
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
    streamLines.push(`${marginLeft} ${y} Td`);
    streamLines.push(`(${escaped}) Tj`);
    // Reset position for next line
    streamLines.push(`${-marginLeft} ${-y} Td`);
  }

  streamLines.push('ET');
  const stream = streamLines.join('\n');

  // Build PDF objects
  const objects: string[] = [];
  const offsets: number[] = [];
  let output = '%PDF-1.4\n';

  // Object 1: Catalog
  offsets.push(output.length);
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  output += obj1;

  // Object 2: Pages
  offsets.push(output.length);
  const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
  output += obj2;

  // Object 3: Page
  offsets.push(output.length);
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`;
  output += obj3;

  // Object 4: Content stream
  offsets.push(output.length);
  const obj4 = `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`;
  output += obj4;

  // Object 5: Font
  offsets.push(output.length);
  const obj5 =
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n';
  output += obj5;

  // Cross-reference table
  const xrefOffset = output.length;
  output += 'xref\n';
  output += `0 ${offsets.length + 1}\n`;
  output += '0000000000 65535 f \n';
  for (const offset of offsets) {
    output += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }

  // Trailer
  output += 'trailer\n';
  output += `<< /Size ${offsets.length + 1} /Root 1 0 R >>\n`;
  output += 'startxref\n';
  output += `${xrefOffset}\n`;
  output += '%%EOF\n';

  return Buffer.from(output, 'utf-8');
}
