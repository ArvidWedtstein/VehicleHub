/** PDF Utils */

import { convertImageUrlToBase64 } from "./format";

export const addText = (
  text: string,
  x: number,
  y: number,
  options: {
    fontSize?: number;
    /** RGB */
    color?: string;
  } = {
    fontSize: 12,
    color: "rgb(0, 0, 0)",
  }
) => {
  const { fontSize = 12, color = "rgb(0, 0, 0)" } = options;

  return `BT\n/F1 ${fontSize} Tf\n${rgbToPdfColor(
    color
  )} rg\n${x} ${y} Td\n(${text}) Tj\nET\n`;
};

export const addLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  /** RGB */
  color: string = "rgb(0, 0, 0)",
  strokeWidth: number = 1,
  lineCap: number = 0, // Line cap style (0 = Butt, 1 = Round, 2 = Projecting square)
  lineJoin: number = 0, // Line join style (0 = Miter, 1 = Round, 2 = Bevel)
  dashPattern: number[] = []
) => {
  strokeWidth = Math.max(0.1, strokeWidth);

  const dashString =
    dashPattern.length > 0 ? `[${dashPattern.join(" ")}] 0 d` : "";

  const lineString = `q
${x1} ${y1} m
${x2} ${y2} l
${rgbToPdfColor(color)} rg
${strokeWidth} w
/LineCap ${lineCap}
/LineJoin ${lineJoin}
${dashString}
S
Q
`;

  return lineString;
};

export const addImage = async (
  imageUrl: string,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const base64Image = await convertImageUrlToBase64(imageUrl);

  const imgData = base64Image.replace(/^data:image\/(png|jpeg);base64,/, "");

  // The content stream for adding an image to the PDF
  const imageObjId = 10; // Example object ID, this should be dynamically assigned in real case
  const imageObjContent = `
    ${imageObjId} 0 obj
    << /Type /XObject
       /Subtype /Image
       /Width ${width}
       /Height ${height}
       /ColorSpace /DeviceRGB
       /BitsPerComponent 8
       /Filter /DCTDecode
       /Length ${imgData.length}
    >>
    stream
    ${imgData}
    endstream
    endobj
  `;

  const content = `
    ${x} ${y} ${width} ${height} re
    ${imageObjId} 0 obj Do
  `;

  return { imageObjContent, content };
};

export const addTable = (
  tableData: string[][], // 2D array with the table data (rows and columns)
  startX: number, // Starting X position for the table
  startY: number, // Starting Y position for the table
  columnWidths: number[], // Array with the width of each column
  rowHeight: number = 12, // Height for each row
  fontSize: number = 12, // Font size for the text
  cellPadding: number = 4,
  cornerRadius: number = 1
) => {
  let content = "";
  let currentY = startY;

  // Draw each row in the table
  for (let row = 0; row < tableData.length; row++) {
    let currentX = startX;

    // Draw each cell in the row
    for (let col = 0; col < (tableData[row]?.length || 0); col++) {
      const cellText = tableData[row]?.[col];

      content += `0.5 w\n`;

      const topLeftX = col === 0 ? currentX + cornerRadius : currentX;
      const topLeftY = row === 0 ? currentY - cornerRadius : currentY;

      const topRightX =
        col === tableData[row]?.length || 0 - 1
          ? currentX + (columnWidths[col] || 0) - cornerRadius
          : currentX + (columnWidths[col] || 0);

      const bottomLeftY =
        row === tableData.length - 1
          ? currentY - rowHeight + cornerRadius
          : currentY - rowHeight;

      content += `q  % Save graphics state
${
  row === 0 ? topLeftX : topRightX
} ${currentY} m % Move to starting point (top-left with cornerRadius)

${row === 0 ? `${topRightX} ${currentY} l` : ""}  % Top straight line
${topRightX} ${currentY} ${currentX + (columnWidths[col] || 0)} ${currentY} ${
        currentX + (columnWidths[col] || 0)
      } ${topLeftY} c  % Top-right corner (cubic Bezier)

${currentX + (columnWidths[col] || 0)} ${bottomLeftY} l  % Right straight line
${currentX + (columnWidths[col] || 0)} ${bottomLeftY} ${
        currentX + (columnWidths[col] || 0)
      } ${currentY - rowHeight} ${topRightX} ${
        currentY - rowHeight
      } c  % Bottom-right corner

${topLeftX} ${currentY - rowHeight} l  % Bottom straight line
${topLeftX} ${currentY - rowHeight} ${currentX} ${
        currentY - rowHeight
      } ${currentX} ${bottomLeftY} c  % Bottom-left corner

${currentX} ${topLeftY} l  % Left straight line
${currentX} ${topLeftY} ${currentX} ${currentY} ${topLeftX} ${currentY} c  % Top-left corner

S  % Stroke the path (draw the shape)
Q  % Restore graphics state
      `;
      content += "S\n"; // Stroke the path (draw the border)

      // Add text inside the cell
      content += wrapText(
        cellText || "",
        currentX + cellPadding,
        currentY - rowHeight + cellPadding,
        currentX + (columnWidths?.[col] || 0),
        fontSize
      );

      // Move to the next column (adjust X position)
      currentX += columnWidths[col] || 0;
    }

    // Move to the next row (adjust Y position)
    currentY -= rowHeight;
  }

  return { content, height: startY - currentY };
};

// Color Utils
export const rgbToPdfColor = (rgb: string): string => {
  const regex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
  const match = rgb.match(regex);

  if (!match) {
    throw new Error("Invalid RGB value format. Expected format: rgb(r, g, b)");
  }

  const r = parseInt(match[1] || "");
  const g = parseInt(match[2] || "");
  const b = parseInt(match[3] || "");

  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    throw new Error("RGB values must be between 0 and 255");
  }

  const rPdf = (r / 255).toFixed(3);
  const gPdf = (g / 255).toFixed(3);
  const bPdf = (b / 255).toFixed(3);

  return `${rPdf} ${gPdf} ${bPdf}`; // 'rg' is the PDF operator for color
};

export const wrapText = (
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number = 12
) => {
  const words = text.split(" ");
  let line = "";
  const lines: string[] = [];

  words.forEach((word) => {
    const testLine = line + (line ? " " : "") + word;
    const textWidth = testLine.length * (fontSize * 0.5); // Rough estimate

    if (textWidth > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });

  if (line) lines.push(line);

  const textCommands = lines
    .map(
      (line, i) =>
        `BT\n/F1 ${fontSize} Tf\n${x} ${
          y - i * (fontSize + 4)
        } Td\n(${line}) Tj\nET`
    )
    .join("\n");

  return textCommands;
};

export const generatePDFWithImages = (
  pages: {
    width: number;
    height: number;
    content: string;
    images?: {
      x: number;
      y: number;
      width: number;
      height: number;
      base64: string;
    }[];
  }[]
) => {
  const pdf = `%PDF-1.6\n`;
  let objects: string[] = [];
  let xrefOffsets: number[] = [0]; // Start with 0 offset for xref
  let byteOffset = pdf.length;

  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
  xrefOffsets.push(byteOffset);
  byteOffset += objects[0]?.length || 0;

  const pageRefs = pages.map((_, i) => `${3 + 2 * i} 0 R`).join(" ");
  objects.push(
    `2 0 obj\n<< /Type /Pages /Count ${pages.length} /Kids [${pageRefs}] >>\nendobj\n`
  );
  xrefOffsets.push(byteOffset);
  byteOffset += objects[1]?.length || 0;

  const imageObjects: string[] = [];
  const imageXObjectRefs: string[] = [];

  pages.forEach((page, i) => {
    let imgRefs = "";
    if (page.images && page.images.length > 0) {
      imgRefs = `/XObject << ${page.images
        .map((_, idx) => `/Im${i}${idx} ${6 + imageObjects.length} 0 R`)
        .join(" ")} >>`;
      page.images.forEach((img) => {
        const imgObj = `${
          6 + imageObjects.length
        } 0 obj\n<< /Type /XObject /Subtype /Image /Width ${
          img.width
        } /Height ${
          img.height
        } /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${
          img.base64.length
        } >>\nstream\n${img.base64}\nendstream\nendobj\n`;
        imageObjects.push(imgObj);
        imageXObjectRefs.push(imgObj);
      });
    }

    const pageObj = `${
      3 + 2 * i
    } 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.width} ${
      page.height
    }] /Contents ${
      4 + 2 * i
    } 0 R /Resources << /Font << /F1 4000 0 R >> ${imgRefs} >> >>\nendobj\n`;
    objects.push(pageObj);
    xrefOffsets.push(byteOffset);
    byteOffset += pageObj.length;

    let contentStream = `stream\n`;
    contentStream += addPageFooter(i + 1, page);

    contentStream += `\n${page.content}\nendstream`;

    const contentObj = `${4 + 2 * i} 0 obj\n<< /Length ${
      contentStream.length
    } >>\n${contentStream}\nendobj\n`;
    objects.push(contentObj);
    xrefOffsets.push(byteOffset);
    byteOffset += contentObj.length;
  });

  const fontObj = `4000 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;
  objects.push(fontObj);
  xrefOffsets.push(byteOffset);
  byteOffset += fontObj.length;

  // Append Image Objects
  objects = [...objects, ...imageObjects];
  xrefOffsets = [
    ...xrefOffsets,
    ...imageXObjectRefs.map((_, idx) => byteOffset + idx),
  ];

  let xrefTable = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  xrefOffsets.forEach((offset) => {
    xrefTable += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });

  const startXref = byteOffset;
  const trailer = `trailer\n<< /Size ${
    objects.length + 1
  } /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;

  return pdf + objects.join("") + xrefTable + trailer;
};

const addPageFooter = (
  pageNumber: number,
  pageSettings: { width: number; height: number }
) => {
  let content = "";
  const padding = 30;

  content += addLine(
    padding,
    padding,
    pageSettings.width - padding,
    padding,
    "rgb(0, 0, 0)",
    0.1
  );
  content += addText(
    `Page ${pageNumber}`,
    pageSettings.width - padding * 2,
    padding / 2,
    {
      fontSize: 8,
    }
  );

  return content;
};
