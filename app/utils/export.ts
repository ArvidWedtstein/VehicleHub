export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const openBlob = (blob: Blob) => {
  const url = URL.createObjectURL(blob);

  window.open(url);
};

export const exportToTxt = (text: string) => {
  return new Blob([text], { type: "text/plain" });
};

export const exportToCSV = <T>(rows: T[], columns: (keyof T)[]) => {
  const header = columns.join(",");

  const dataRows = rows.map((row) => {
    return columns
      .map((column) => {
        const value = row[column];
        return typeof value === "string"
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      })
      .join(",");
  });

  // Combine header and rows
  const csvContent = [header, ...dataRows].join("\n");

  return new Blob([csvContent], { type: "text/csv" });
};

export const parseRowsToTable = <T extends Record<string, unknown>>(
  rows: T[],
  columns: Array<keyof T>
) => {
  const divider = "|";
  const headerRowDivider = "-";

  const formattedRows = rows.map((row) => {
    return columns.reduce((acc, column) => {
      if (column in row) {
        acc[column] = row[column];
      }
      return acc;
    }, {} as Partial<T>);
  });

  const columnsLength = columns.map((col) => {
    const maxColumnLength = Math.max(
      ...formattedRows.map(
        (row) => String(row[col]).replace(/(?:\r\n|\r|\n)/g, "").length
      ),
      String(col).length
    );

    return {
      column: col,
      length: maxColumnLength + 1,
    };
  });

  const headerRow = columnsLength
    .map(({ column, length }) => {
      return `${String(column)}${" ".repeat(length - String(column).length)}`;
    })
    .join(divider);

  const dividerRow = columnsLength
    .map(({ length }) => headerRowDivider.repeat(length))
    .join(divider);

  const rowsString = formattedRows
    .map((row) => {
      return columnsLength
        .map(({ column, length }) => {
          return `${String(row[column])}${" ".repeat(
            length - String(row[column]).length
          )}`;
        })
        .join(divider);
    })
    .join("\n");

  return `${headerRow}\n${dividerRow}\n${rowsString}`;
};

/**
 * PDF Report generator
 * @param expenses
 * @returns
 *
 */
export const generateExpenseReport = async <T extends Record<string, unknown>>(
  expenses: T[],
  sortByKey: keyof T,
  groupByKey: keyof T,
  columns: {
    field: keyof T;
    /** Default is 100px */
    width?: number;
  }[]
) => {
  const page = {
    width: 595,
    height: 842,
  };
  const padding = 30;

  const startY = page.height;
  const pages = [{ content: "", ...page }];
  const y = startY - padding * 2; // Starting Y position for text
  // const total = expenses.reduce((sum, e) => sum + e.amount, 0); // Calculate total

  const sortedExpenses = dynamicSort(expenses, sortByKey);

  const groupedExpenses = groupBy(sortedExpenses, groupByKey);

  let content = "";

  // Header
  const header = {
    x: 200,
    y: page.height - padding,
    fontSize: 20,
  };

  content += addText(`Expense Report`, header.x, header.y, {
    fontSize: header.fontSize,
  });
  content += addLine(
    padding,
    header.y - header.fontSize / 2,
    page.width - padding,
    header.y - header.fontSize / 2
  );

  const table = {
    x: padding,
    y: y,
    date: 50,
    description: 200,
    amount: 450,
  };

  for (const [groupHeader, expenses] of Object.entries(groupedExpenses)) {
    table.y -= 30;
    if (table.y < 50) {
      // const { pageRef, content: pageContent } = addPageBreak(10, page);

      const lastPage = pages[pages.length - 1];
      if (lastPage) {
        lastPage.content = content;
      }

      pages.push({ content: "", ...page });
      content = "";
      table.y = startY - padding * 2;
      table.y -= 30;
    }
    content += addText(groupHeader, padding, table.y, {
      fontSize: 12,
      color: "rgb(0,0,0)",
    });

    table.y -= 5;

    const tableData = expenses.map((expense) =>
      columns.map((col) => (expense[col.field] ?? "None").toString())
    );

    const { content: tableContent, height } = addTable(
      tableData,
      padding, // Start X position
      table.y, // Start Y position
      columns.map(({ width }) => width ?? 100), // Column widths
      15, // Row height
      10 // Font size
    );
    content += tableContent;

    table.y -= height;
  }

  const lastPage = pages[pages.length - 1];
  if (lastPage) {
    lastPage.content = content;
  }

  const pdfContent = generatePDFWithImages(pages);

  const blob = new Blob([pdfContent], { type: "application/pdf" });

  return blob;
};

// Generates ics file, which is used to add events to calendar
export const generateICSFile = (event: {
  title: string | null;
  description: string | null;
  location: string | null;
  startDate: Date;
  endDate: Date;
}): void => {
  const { title, description, location, startDate, endDate } = event;
  const pad = (num: number) => num.toString().padStart(2, "0");

  // Convert Date to ICS-compliant format: YYYYMMDDTHHMMSSZ (UTC)
  const formatICSDate = (date: Date): string => {
    return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(
      date.getUTCDate()
    )}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(
      date.getUTCSeconds()
    )}Z`;
  };

  const start = formatICSDate(startDate);
  const end = formatICSDate(endDate);
  const uid = `${Date.now()}@vehiclehub.com`;

  // Create ICS file content
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//VehicleHub//Vehicle Reminder//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${uid}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
DTSTART:${start}
DTEND:${end}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Your vehicle service is coming up!
END:VALARM
END:VEVENT
END:VCALENDAR`;

  // Status: TENTATIVE, CONFIRMED, CANCELLED
  // CATEGORIES: Event category
  // TRANSP: OPAQUE, TRANSPARENT
  // PRIORITY: 0 (default) - 9 (highest)
  // CLASS: PUBLIC, PRIVATE, CONFIDENTIAL
  // RRULE:FREQ=MONTHLY;COUNT=6 => Repeat every month for 6 times
  // BEGIN:VALARM to set alerts.

  // Create a Blob and generate download link
  const blob = new Blob([icsContent], { type: "text/calendar" });

  downloadBlob(blob, "event.ics");
};
