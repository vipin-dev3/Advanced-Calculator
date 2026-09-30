import { HistoryItem } from '../types/calculator';
import { formatDateFull } from './formatters';

export function exportHistoryAsCSV(history: HistoryItem[]): void {
  if (!history.length) return;

  const headers = ['Timestamp', 'Date', 'Mode', 'Expression', 'Result'];
  const rows = history.map((item) => [
    item.timestamp,
    `"${formatDateFull(item.timestamp)}"`,
    `"${item.mode}"`,
    `"${item.expression.replace(/"/g, '""')}"`,
    `"${item.result.replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  downloadBlob(csvContent, `omni-calc-history-${Date.now()}.csv`, 'text/csv;charset=utf-8;');
}

export function exportHistoryAsJSON(history: HistoryItem[]): void {
  if (!history.length) return;
  const jsonContent = JSON.stringify(history, null, 2);
  downloadBlob(jsonContent, `omni-calc-history-${Date.now()}.json`, 'application/json;charset=utf-8;');
}

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}
