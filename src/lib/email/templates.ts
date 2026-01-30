// Default email template definitions
export const defaultEmailTemplates = [
  {
    name: "Welcome Email",
    slug: "welcome",
    subject: "Welcome to {{siteName}}!",
    description: "Sent to new users when they register",
    variables: {
      userName: "User's display name",
      userEmail: "User's email address",
      siteName: "Your site name",
      loginUrl: "URL to login page",
    },
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to {{siteName}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #18181b; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">{{siteName}}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="color: #18181b; margin: 0 0 16px; font-size: 20px;">Welcome, {{userName}}!</h2>
              <p style="color: #52525b; margin: 0 0 24px; font-size: 16px; line-height: 1.6;">
                Thank you for joining {{siteName}}. We're excited to have you on board!
              </p>
              <p style="color: #52525b; margin: 0 0 24px; font-size: 16px; line-height: 1.6;">
                Your account has been created with the email: <strong>{{userEmail}}</strong>
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #18181b; border-radius: 6px;">
                    <a href="{{loginUrl}}" style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 500;">
                      Get Started
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f5; padding: 16px 24px; text-align: center;">
              <p style="color: #71717a; margin: 0; font-size: 14px;">
                © {{siteName}}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
    textContent: `
Welcome to {{siteName}}!

Hello {{userName}},

Thank you for joining {{siteName}}. We're excited to have you on board!

Your account has been created with the email: {{userEmail}}

Get started: {{loginUrl}}

© {{siteName}}. All rights reserved.
    `.trim(),
  },
  {
    name: "Password Reset",
    slug: "password-reset",
    subject: "Reset Your Password",
    description: "Sent when a user requests a password reset",
    variables: {
      userName: "User's display name",
      resetLink: "Password reset URL",
      expiryTime: "Link expiry time (e.g., '1 hour')",
      siteName: "Your site name",
    },
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #18181b; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">{{siteName}}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="color: #18181b; margin: 0 0 16px; font-size: 20px;">Reset Your Password</h2>
              <p style="color: #52525b; margin: 0 0 24px; font-size: 16px; line-height: 1.6;">
                Hi {{userName}}, we received a request to reset your password. Click the button below to create a new password.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #18181b; border-radius: 6px;">
                    <a href="{{resetLink}}" style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 500;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #71717a; margin: 24px 0 0; font-size: 14px; line-height: 1.6;">
                This link will expire in {{expiryTime}}. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f5; padding: 16px 24px; text-align: center;">
              <p style="color: #71717a; margin: 0; font-size: 14px;">
                © {{siteName}}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
    textContent: `
Reset Your Password

Hi {{userName}},

We received a request to reset your password. Click the link below to create a new password:

{{resetLink}}

This link will expire in {{expiryTime}}. If you didn't request a password reset, you can safely ignore this email.

© {{siteName}}. All rights reserved.
    `.trim(),
  },
  {
    name: "Subscription Started",
    slug: "subscription-started",
    subject: "Welcome to {{planName}} - Subscription Confirmed",
    description: "Sent when a user subscribes to a plan",
    variables: {
      userName: "User's display name",
      planName: "Subscription plan name",
      billingPeriod: "Monthly or Yearly",
      price: "Subscription price",
      nextBillingDate: "Next billing date",
      siteName: "Your site name",
      dashboardUrl: "URL to dashboard",
    },
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #16a34a; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Subscription Confirmed!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="color: #18181b; margin: 0 0 16px; font-size: 20px;">Thank you, {{userName}}!</h2>
              <p style="color: #52525b; margin: 0 0 24px; font-size: 16px; line-height: 1.6;">
                Your subscription to <strong>{{planName}}</strong> has been confirmed.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; border-radius: 6px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="color: #71717a; font-size: 14px; padding-bottom: 8px;">Plan</td>
                        <td style="color: #18181b; font-size: 14px; font-weight: 500; text-align: right; padding-bottom: 8px;">{{planName}}</td>
                      </tr>
                      <tr>
                        <td style="color: #71717a; font-size: 14px; padding-bottom: 8px;">Billing Period</td>
                        <td style="color: #18181b; font-size: 14px; font-weight: 500; text-align: right; padding-bottom: 8px;">{{billingPeriod}}</td>
                      </tr>
                      <tr>
                        <td style="color: #71717a; font-size: 14px; padding-bottom: 8px;">Price</td>
                        <td style="color: #18181b; font-size: 14px; font-weight: 500; text-align: right; padding-bottom: 8px;">{{price}}</td>
                      </tr>
                      <tr>
                        <td style="color: #71717a; font-size: 14px;">Next Billing</td>
                        <td style="color: #18181b; font-size: 14px; font-weight: 500; text-align: right;">{{nextBillingDate}}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #18181b; border-radius: 6px;">
                    <a href="{{dashboardUrl}}" style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 500;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f5; padding: 16px 24px; text-align: center;">
              <p style="color: #71717a; margin: 0; font-size: 14px;">
                © {{siteName}}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
    textContent: `
Subscription Confirmed - {{planName}}

Thank you, {{userName}}!

Your subscription to {{planName}} has been confirmed.

Subscription Details:
- Plan: {{planName}}
- Billing Period: {{billingPeriod}}
- Price: {{price}}
- Next Billing: {{nextBillingDate}}

Go to Dashboard: {{dashboardUrl}}

© {{siteName}}. All rights reserved.
    `.trim(),
  },
  {
    name: "Subscription Cancelled",
    slug: "subscription-cancelled",
    subject: "Subscription Cancelled",
    description: "Sent when a user cancels their subscription",
    variables: {
      userName: "User's display name",
      planName: "Cancelled plan name",
      endDate: "When access ends",
      siteName: "Your site name",
      resubscribeUrl: "URL to resubscribe",
    },
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription Cancelled</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #18181b; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">{{siteName}}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="color: #18181b; margin: 0 0 16px; font-size: 20px;">Subscription Cancelled</h2>
              <p style="color: #52525b; margin: 0 0 24px; font-size: 16px; line-height: 1.6;">
                Hi {{userName}}, your <strong>{{planName}}</strong> subscription has been cancelled as requested.
              </p>
              <p style="color: #52525b; margin: 0 0 24px; font-size: 16px; line-height: 1.6;">
                You'll continue to have access until <strong>{{endDate}}</strong>.
              </p>
              <p style="color: #52525b; margin: 0 0 24px; font-size: 16px; line-height: 1.6;">
                We'd love to have you back! If you change your mind, you can resubscribe at any time.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #18181b; border-radius: 6px;">
                    <a href="{{resubscribeUrl}}" style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 500;">
                      Resubscribe
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f5; padding: 16px 24px; text-align: center;">
              <p style="color: #71717a; margin: 0; font-size: 14px;">
                © {{siteName}}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
    textContent: `
Subscription Cancelled

Hi {{userName}},

Your {{planName}} subscription has been cancelled as requested.

You'll continue to have access until {{endDate}}.

We'd love to have you back! If you change your mind, you can resubscribe at any time:
{{resubscribeUrl}}

© {{siteName}}. All rights reserved.
    `.trim(),
  },
  {
    name: "Email Verification",
    slug: "email-verification",
    subject: "Verify Your Email Address",
    description: "Sent to verify user's email address",
    variables: {
      userName: "User's display name",
      verifyLink: "Email verification URL",
      expiryTime: "Link expiry time",
      siteName: "Your site name",
    },
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #18181b; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">{{siteName}}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="color: #18181b; margin: 0 0 16px; font-size: 20px;">Verify Your Email</h2>
              <p style="color: #52525b; margin: 0 0 24px; font-size: 16px; line-height: 1.6;">
                Hi {{userName}}, please verify your email address by clicking the button below.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #18181b; border-radius: 6px;">
                    <a href="{{verifyLink}}" style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 500;">
                      Verify Email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #71717a; margin: 24px 0 0; font-size: 14px; line-height: 1.6;">
                This link will expire in {{expiryTime}}. If you didn't create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f5; padding: 16px 24px; text-align: center;">
              <p style="color: #71717a; margin: 0; font-size: 14px;">
                © {{siteName}}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
    textContent: `
Verify Your Email

Hi {{userName}},

Please verify your email address by clicking the link below:

{{verifyLink}}

This link will expire in {{expiryTime}}. If you didn't create an account, you can safely ignore this email.

© {{siteName}}. All rights reserved.
    `.trim(),
  },
]
