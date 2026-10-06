# Care Companion UAT

i want to you to make Build a web app called Care Coordination — UAT Companion.

It is a guided user acceptance testing tool. Clinical staff at a Saudi healthcare organisation scan a QR code on a presentation slide, land on this app, sign in with three fields, and are walked through 14 testing steps one screen at a time. They record a result and notes on each step, give feedback at the end, and submit. A coordinator sees every tester live also suppoty mobaile and laptob view

This project was built with [Lovable](https://lovable.dev).

## Google Sheets integration

When a tester selects **Submit my results**, the app saves their final result in
Supabase and then sends the tester summary and all 14 step results to the Google
Apps Script web-app URL. The server-side call avoids browser CORS restrictions.

The included receiver is [docs/google-apps-script.gs](docs/google-apps-script.gs).

1. Open the target Google Sheet, then choose **Extensions → Apps Script**.
2. Replace the editor contents with `docs/google-apps-script.gs` and save.
3. Deploy it as a **Web app**, executing as the spreadsheet owner and granting
   access to **Anyone**. The app server, not the tester's browser, calls this
   endpoint; protect it with the token in the next step.
4. If the deployment produces a new URL, set `GOOGLE_SHEETS_WEB_APP_URL` in the
   server environment. The supplied deployment URL is used by default.
5. For write protection, set `UAT_WEBHOOK_TOKEN` in Apps Script properties and
   the same `GOOGLE_SHEETS_WRITE_TOKEN` value in the app server environment.

The script creates two tabs on its first submission: **UAT submissions** (one
row per tester) and **UAT step results** (one row per tester and UAT step). It
updates existing rows by submission ID, so a user retry will not create a
duplicate record.

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/75a9a36e-5a37-4e7f-965f-710df2481394).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
