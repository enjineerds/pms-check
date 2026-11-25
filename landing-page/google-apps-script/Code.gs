/**
 * PMS Check waitlist: receives sign-ups from the landing page and appends them to a Google Sheet.
 *
 * Setup: see README.md in this folder. Paste this file into the Apps Script editor of a
 * Google Sheet (Extensions > Apps Script), then deploy it as a web app.
 * Each new sign-up also emails a notification to NOTIFY_EMAIL (a NOTIFY_EMAIL Script property
 * overrides it).
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
  let total = 0;
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
    if (!existing) {
      sheet.appendRow([new Date(), email, source]);
      total = sheet.getLastRow() - 1;
    }
  } finally {
    lock.releaseLock();
  }

  if (total) notify(email, source, total);
  return respond({ ok: true });
}

// A failed notification must never fail the sign-up itself.
function notify(email, source, total) {
  try {
    const to =
      PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
    const url = SpreadsheetApp.getActiveSpreadsheet().getUrl();
    MailApp.sendEmail({
      to: to,
      subject: 'PMS Check waitlist: new sign-up (' + total + ' total)',
      body: [
        'Email: ' + email,
        'Source: ' + source,
        'Time: ' + new Date().toString(),
        'Total on the waitlist: ' + total,
        '',
        'Sheet: ' + url,
      ].join('\n'),
    });
  } catch (err) {
    console.error('Waitlist notification failed: ' + err);
  }
}

// Run once from the editor to approve the mail permission and send yourself a test.
function testNotify() {
  notify('test@example.com', 'manual-test', 0);
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
