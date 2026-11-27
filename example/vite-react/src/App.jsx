import HTMLtoDOCX from 'html-to-docx';
import { useState } from 'react';

import { sampleHTML } from './sample';

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

export default function App() {
  const [html, setHtml] = useState(sampleHTML);
  const [status, setStatus] = useState('');

  const convert = async () => {
    setStatus('Converting…');
    try {
      // In the browser HTMLtoDOCX resolves to a Blob.
      const blob = await HTMLtoDOCX(html, null, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
      });
      downloadBlob(blob, 'html-to-docx.docx');
      setStatus(`Done: ${Math.round(blob.size / 1024)} KB`);
    } catch (error) {
      setStatus(`Failed: ${error.message}`);
    }
  };

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 960, margin: '2rem auto' }}>
      <h1>html-to-docx</h1>
      <p>Edit the HTML and download it as a Word document.</p>
      <textarea
        aria-label="HTML to convert"
        value={html}
        onChange={(event) => setHtml(event.target.value)}
        rows={24}
        style={{ width: '100%', fontFamily: 'monospace' }}
      />
      <p>
        <button type="button" onClick={convert}>
          Download .docx
        </button>{' '}
        <span role="status">{status}</span>
      </p>
    </main>
  );
}
