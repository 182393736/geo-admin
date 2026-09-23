/** 简易 Excel 导出（对标线上 sheetjs aoa → xlsx） */
import * as XLSX from 'xlsx';

export function downloadAoaSheets(
  sheets: { name: string; rows: any[][]; cols?: { wch: number }[] }[],
  filename: string,
) {
  const book = XLSX.utils.book_new();
  for (const s of sheets) {
    const ws = XLSX.utils.aoa_to_sheet(s.rows);
    if (s.cols) ws['!cols'] = s.cols;
    XLSX.utils.book_append_sheet(book, ws, s.name.slice(0, 31));
  }
  XLSX.writeFile(book, filename);
}
