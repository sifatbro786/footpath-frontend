// src/lib/admin/exportCsv.js
//
// CSV export for admin tables.
//
// Hand rolled rather than pulling in a library: the requirement is a few
// hundred rows of already-clean data, and the only genuinely tricky part is
// escaping, which is a dozen lines.

/**
 * Escape one cell.
 *
 * Two separate concerns:
 *
 * 1. CSV correctness. A value containing a comma, quote or newline must be
 *    wrapped in quotes with internal quotes doubled.
 *
 * 2. FORMULA INJECTION. Excel and Sheets execute a cell that begins with
 *    = + - or @, so an order placed under the name "=cmd|'/c calc'!A1" becomes
 *    a live formula the moment an admin opens the export. Prefixing with a
 *    single quote neutralises it while still displaying the original text.
 *    This matters here because most of what we export is customer supplied.
 */
const escapeCell = (value) => {
    if (value === null || value === undefined) return "";

    let str = String(value);

    if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
    }

    if (/[",\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

/**
 * Build and download a CSV.
 *
 * @param filename  without extension
 * @param columns   [{ key, label, format? }]
 * @param rows      array of records
 */
export function exportCsv({ filename, columns, rows }) {
    const header = columns.map((c) => escapeCell(c.label)).join(",");

    const body = rows
        .map((row) =>
            columns
                .map((column) => {
                    const raw = column.format ? column.format(row) : row[column.key];
                    return escapeCell(raw);
                })
                .join(","),
        )
        .join("\n");

    // The BOM makes Excel read the file as UTF-8. Without it, Bengali names and
    // the taka sign arrive as mojibake, which is the most common complaint
    // about CSV exports from a Bangladeshi shop.
    const blob = new Blob(["﻿" + header + "\n" + body], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export default exportCsv;
