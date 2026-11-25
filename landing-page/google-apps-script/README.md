# Waitlist to Google Sheet

The landing page POSTs each sign-up to a Google Apps Script web app, which adds a row to a sheet.

## Set up (about 5 minutes)

1. Create a new Google Sheet. Name it "PMS Check waitlist". Keep it private (don't share it with anyone you don't want reading emails).
2. In the sheet: **Extensions > Apps Script**.
3. Delete the starter code and paste in all of `Code.gs` from this folder. Save.
4. **Deploy > New deployment**. Click the gear next to "Select type" and choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy** and approve the permission prompt (it asks to edit your spreadsheets).
5. Copy the **Web app URL** (it ends in `/exec`).
6. In `landing-page/`, copy `.env.example` to `.env` and set:
   `PUBLIC_WAITLIST_ENDPOINT=<the web app URL>`
7. Rebuild and redeploy the site (`bun run build`). The variable is read at build time.

On the first sign-up the script creates a `Waitlist` tab with the columns Timestamp, Email, Source.

## Email notifications

Each new sign-up emails you: the address, the source, the time, and the running total, with a link to the sheet. Repeat sign-ups and bot submissions don't send anything.

- **Turn it on:** in the Apps Script editor, choose `testNotify` in the function menu and click **Run**. Approve the new "Send email as you" permission. A test email arrives at the recipient below. Then redeploy (see below); the live web app won't send mail until you do.
- **Recipient:** `NOTIFY_EMAIL` at the top of `Code.gs`. To change it without editing code, add a Script property `NOTIFY_EMAIL` (**Project Settings > Script properties**); it takes precedence.
- **Limits:** a personal Google account can send about 100 emails a day from Apps Script (1,500 for Workspace). Past that, sign-ups are still saved; only the notification is skipped. Failures are logged under **Executions**.

## Changing the script later

Editing `Code.gs` does nothing until you redeploy: **Deploy > Manage deployments > edit (pencil) > Version: New version > Deploy**. The URL stays the same.

## Behavior

- A repeat sign-up from the same address is accepted but not added twice. The page can't tell the visitor which, so it can't be used to check who is on the list.
- Invalid addresses and the hidden "company" bot field are rejected on the server as well as in the browser.
- The URL is public by design (the page calls it), so anyone who finds it can submit addresses. The checks above limit abuse. Watch the sheet's row count for spikes.

## Deleting someone (privacy policy: "until you ask us to delete it")

Find their row in the sheet (**Edit > Find**), then right-click the row number and **Delete row**.

## Troubleshooting

**Browser console shows a CORS error or `net::ERR_FAILED` for the `/exec` URL.**
Two separate causes:

1. *The deployment isn't public.* Open the `/exec` URL in a private/incognito window. You should see
   `{"ok":true,"service":"pms-check-waitlist"}`. If you see "You need access" or a Google sign-in page,
   set **Deploy > Manage deployments > (pencil) > Who has access: Anyone**, choose **New version**, and
   **Deploy**. ("Anyone with Google account" or a Workspace-only setting won't work for site visitors.)
   If **Anyone** isn't offered, your Google Workspace admin has blocked public web apps; use a personal Google account.
2. *The live site is an old build.* Older builds sent JSON, which makes the browser send a preflight check
   that Google can't answer ("Response to preflight request doesn't pass access control check"). Rebuild with
   `PUBLIC_WAITLIST_ENDPOINT` set and redeploy the site.
