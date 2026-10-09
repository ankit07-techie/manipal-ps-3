import JSZip from 'jszip';

/**
 * Helper to generate small, valid synthetic .docx files in memory for unit testing without external dependencies.
 */
export async function createSyntheticDocx(options: {
  paragraphs?: string[];
  tables?: string[][][]; // table -> rows -> cells
  empty?: boolean;
}): Promise<Buffer> {
  const zip = new JSZip();

  // Content Types
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  // Relationships
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  // Document XML content
  let bodyContent = '';

  if (!options.empty) {
    if (options.paragraphs) {
      for (const p of options.paragraphs) {
        bodyContent += `<w:p><w:r><w:t>${p}</w:t></w:r></w:p>`;
      }
    }

    if (options.tables) {
      for (const table of options.tables) {
        bodyContent += '<w:tbl>';
        for (const row of table) {
          bodyContent += '<w:tr>';
          for (const cell of row) {
            bodyContent += `<w:tc><w:p><w:r><w:t>${cell}</w:t></w:r></w:p></w:tc>`;
          }
          bodyContent += '</w:tr>';
        }
        bodyContent += '</w:tbl>';
      }
    }
  }

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyContent}
  </w:body>
</w:document>`;

  zip.file('word/document.xml', documentXml);

  const arrayBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  return arrayBuffer;
}
