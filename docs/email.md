# Email

This document describes the email system: SMTP configuration, the Nodemailer setup, and every template the application sends.

---

## Infrastructure

### Local development

Mailpit catches all outgoing email in local development — nothing actually leaves your machine.

| Service            | Address                 |
| ------------------ | ----------------------- |
| SMTP (for the app) | `localhost:1025`        |
| Mailpit web UI     | `http://localhost:8025` |

Start Mailpit with `docker compose up -d`.

### Production

Set the `SMTP_*` environment variables to your production SMTP provider. Any standard SMTP server is supported (SendGrid, Mailgun, Postmark, etc. via their SMTP gateway).

### Environment variables

| Variable        | Local default             | Description                        |
| --------------- | ------------------------- | ---------------------------------- |
| `SMTP_HOST`     | `localhost`               | SMTP server hostname               |
| `SMTP_PORT`     | `1025`                    | SMTP server port                   |
| `SMTP_USER`     | `test`                    | SMTP username                      |
| `SMTP_PASSWORD` | `test`                    | SMTP password                      |
| `MAIL_FROM`     | `outa.one <hey@outa.one>` | `From` header on all outgoing mail |

---

## Implementation

**File:** `src/lib/server/mail.ts`

A single Nodemailer transporter is created at module load time (singleton):

```ts
const transporter = nodemailer.createTransport({ host, port, auth: { user, pass } });

export async function sendEmail({ to, subject, html }) {
  await transporter.sendMail({ from: env.MAIL_FROM, to, subject, html });
}
```

Email delivery in `users.ts` (invites) is **best-effort**: a failed send is caught and logged, but does not block the operation. The invite URL is always returned to the admin regardless.

---

## Templates

All templates are in `src/lib/server/email-templates.ts`. They share a common `base(content, footerNote)` layout function that produces a branded HTML email (white card on light grey background, outa.one logo header, content body, footer).

Brand colours: `#4353F0` (primary), `#EEF0FE` (light accent).

---

### Invite email

**Trigger:** Admin invites a user from `/admin/users`  
**Recipient:** The invited email address  
**Subject:** `"You're invited to outa.one"`

**Function:** `inviteEmail(url: string, expiresInDays = 7)`

Content:

- Heading: "You're invited to outa.one"
- Body text explaining the invitation
- "Accept invitation" CTA button → `url`
- Fallback URL box (for email clients that block links)
- Expiry note: "This invitation expires in N days and can only be used once."

Footer: "You received this email because you were invited to join outa.one."

---

### Password reset email

**Trigger:** User submits `/forgot-password`  
**Recipient:** The email address submitted  
**Subject:** `"Reset your password – outa.one"`

**Function:** `resetPasswordEmail(url: string)`

Content:

- Heading: "Reset your password"
- "Reset password" CTA button → `url`
- Fallback URL box
- Expiry note: "This link expires in 1 hour and can only be used once."

Footer: "You received this email because a password reset was requested for your outa.one account. If you didn't request this, you can safely ignore this email."

---

### License request notification

**Trigger:** Employee requests a product that requires approval  
**Recipients:** All admin users (excluding `@company.com` demo accounts)  
**Subject:** `"License request for {productName}"`

**Function:** `licenseRequestNotificationEmail(requesterName, requesterEmail, productName)`

Content:

- Heading: "New license request"
- Info box with: Product name, Requester name + email
- Footer note: "Log in to the admin dashboard to approve or reject this request."

---

### License approved email

**Trigger:** Admin approves a license request  
**Recipient:** The requesting employee  
**Subject:** `"Your {productName} license has been approved"`

**Function:** `licenseApprovedEmail(userName, productName, licenseKey)`

Content:

- Heading: "Your license request was approved"
- Personalised greeting with product name
- Info box with: Product name, License key (rendered in monospace code style)
- "Keep this key safe. You can also view it at any time by logging in to the portal."

---

### License rejected email

**Trigger:** Admin rejects a license request  
**Recipient:** The requesting employee  
**Subject:** `"Your {productName} license request was not approved"`

**Function:** `licenseRejectedEmail(userName, productName, reason?)`

Content:

- Heading: "Your license request was not approved"
- Personalised message with product name
- If `reason` is provided: red-bordered reason block
- "If you have any questions, please contact your administrator."

---

## Adding a new email template

1. Add a new exported function to `src/lib/server/email-templates.ts` that returns a string.
2. Use the `base(content, footerNote)` helper to wrap your content in the standard layout.
3. Call `sendEmail({ to, subject, html: yourTemplate(...) })` from the relevant server module.

Do not add external template engines or dependencies — raw HTML strings are intentional (zero runtime overhead, simple to debug in Mailpit).
