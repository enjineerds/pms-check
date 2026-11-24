/**
 * PMS Check waitlist: receives sign-ups from the landing page and appends them to a Google Sheet.
 *
 * Setup: see README.md in this folder. Paste this file into the Apps Script editor of a
 * Google Sheet (Extensions > Apps Script), then deploy it as a web app.
 */

const SHEET_NAME = 'Waitlist';
const HEADERS = ['Timestamp', 'Email', 'Source'];
const MAX_EMAIL_LENGTH = 254;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function doPost(e) {
  const p = (e && e.parameter) || {};

  // Honeypot: the page's hidden "company" field is empty for people, filled by bots.
  if (p.company) return respond({ ok: true });

  const email = String(p.email || '').trim().toLowerCase();
  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) {
    return respond({ ok: false, error: 'invalid_email' });
  }
  const source = String(p.source || 'landing-page').slice(0, 60);

  // Two sign-ups at the same instant must not both pass the duplicate check.
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet();
    const existing = sheet
      .getRange('B:B')
      .createTextFinder(email)
      .matchEntireCell(true)
      .matchCase(false)
      .findNext();
    // A repeat sign-up answers exactly like a new one, so the form can't be used
    // to find out whether an address is already on the list.
    if (!existing) sheet.appendRow([new Date(), email, source]);
    return respond({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// Opening the web app URL in a browser answers with a health check.
function doGet() {
  return respond({ ok: true, service: 'pms-check-waitlist' });
}

function getSheet() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    // Plain text, so an address that starts with "=" or "+" is never run as a formula.
    sheet.getRange('B:B').setNumberFormat('@');
  }
  return sheet;
}

function respond(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
