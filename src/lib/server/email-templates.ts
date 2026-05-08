const BRAND_COLOR = '#4353F0';
const BRAND_LIGHT = '#EEF0FE';

// Inline SVG of the logo icon (key on document), white strokes on brand bg
const LOGO_SVG = `<svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M22.5 3H9C8.20435 3 7.44129 3.31607 6.87868 3.87868C6.31607 4.44129 6 5.20435 6 6V30C6 30.7956 6.31607 31.5587 6.87868 32.1213C7.44129 32.6839 8.20435 33 9 33H27C27.7956 33 28.5587 32.6839 29.1213 32.1213C29.6839 31.5587 30 30.7956 30 30V10.5L22.5 3Z" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M15 27C16.6569 27 18 25.6569 18 24C18 22.3431 16.6569 21 15 21C13.3431 21 12 22.3431 12 24C12 25.6569 13.3431 27 15 27Z" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M24 15L17.25 21.75" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M22.5 16.5L24 18" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const LOGO_DATA_URI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(LOGO_SVG)}`;

function base(content: string) {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>outa.one</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center" style="padding:32px 40px 24px;border-bottom:1px solid #e4e4e7;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${BRAND_COLOR};border-radius:14px;width:52px;height:52px;text-align:center;vertical-align:middle;">
                    <img src="${LOGO_DATA_URI}" width="32" height="32" alt="" style="display:block;margin:10px auto;" />
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:12px;">
                    <span style="font-size:18px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">outa.one</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid #e4e4e7;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">
                You received this email because a password reset was requested for your outa.one account.<br />
                If you didn't request this, you can safely ignore this email.
              </p>
              <p style="margin:12px 0 0;font-size:12px;color:#d4d4d8;">
                &copy; ${new Date().getFullYear()} outa.one
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function resetPasswordEmail(url: string) {
	const content = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">Reset your password</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.6;">
      We received a request to reset the password for your account. Click the button below to choose a new password.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <a href="${url}"
            style="display:inline-block;padding:13px 28px;background-color:${BRAND_COLOR};color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;letter-spacing:-0.1px;">
            Reset password
          </a>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background-color:${BRAND_LIGHT};border-radius:8px;padding:14px 16px;">
          <p style="margin:0;font-size:12px;color:#52525b;line-height:1.5;">
            <strong style="color:#09090b;">Link not working?</strong> Copy and paste the URL below into your browser:
          </p>
          <p style="margin:6px 0 0;font-size:11px;color:${BRAND_COLOR};word-break:break-all;">${url}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#a1a1aa;">
      This link expires in <strong style="color:#71717a;">1 hour</strong> and can only be used once.
    </p>
  `;
	return base(content);
}
