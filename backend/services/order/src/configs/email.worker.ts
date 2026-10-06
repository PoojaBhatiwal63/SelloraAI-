import { Worker } from "bullmq";

import redis from "../../../../shared/redis/redis.js";
import transporter from "./mail.js";

// ==========================================================
// EMAIL DESIGN HELPERS
// Table-based, inline-styled HTML so it renders consistently
// across Gmail, Outlook, Apple Mail, etc.
// ==========================================================

const BRAND_COLOR = "#4f46e5";

function emailShell(bodyHtml: string) {
  return `
  <div style="background-color:#f4f5f7;padding:32px 16px;font-family:'Segoe UI',Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;border-collapse:collapse;">
      <tr>
        <td style="background:${BRAND_COLOR};padding:20px 32px;">
          <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">SelloraAI</span>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          ${bodyHtml}
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #eef0f2;">
          <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
            This is an automated email from SelloraAI. Please do not reply directly to this message.
          </p>
        </td>
      </tr>
    </table>
  </div>`;
}

function statusBadge(label: string, color: string, bg: string) {
  return `<span style="display:inline-block;padding:6px 14px;border-radius:999px;background:${bg};color:${color};font-size:13px;font-weight:600;">${label}</span>`;
}

function amountHero(amount: string, label: string, badgeHtml: string) {
  return `
    <div style="text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 10px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.6px;">${label}</p>
      <p style="margin:0 0 12px;font-size:38px;font-weight:800;color:#111827;line-height:1;">${amount}</p>
      ${badgeHtml}
    </div>`;
}

function productCard(rows: { label: string; value: string; emphasis?: boolean }[]) {
  const rowsHtml = rows
    .map(
      (row, index) => `
      <tr>
        <td style="padding:${index === 0 ? "0 0 10px" : "10px 0 0"};font-size:14px;color:#6b7280;">
          ${row.label}
        </td>
        <td style="padding:${index === 0 ? "0 0 10px" : "10px 0 0"};font-size:${
          row.emphasis ? "16px" : "14px"
        };color:#111827;font-weight:${row.emphasis ? "700" : "600"};text-align:right;">
          ${row.value}
        </td>
      </tr>`
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:10px;margin:0 0 20px;border-collapse:collapse;">
      <tr>
        <td style="padding:18px 20px;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:${BRAND_COLOR};text-transform:uppercase;letter-spacing:0.6px;">
            Product Details
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            ${rowsHtml}
          </table>
        </td>
      </tr>
    </table>`;
}

function detailRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:8px 0;font-size:14px;color:#6b7280;">${label}</td>
      <td style="padding:8px 0;font-size:14px;color:#111827;font-weight:600;text-align:right;">${value}</td>
    </tr>`;
}



// ==========================================================
// WORKER
// ==========================================================

const emailWorker = new Worker(
  "email-queue",

  async (job) => {
    // ========================================================
    // PARTNER PAYOUT SENT
    // ========================================================
    if (job.name === "partner-payment-success") {
      const { partnerName, partnerEmail, amount, paymentId, adminEmail } = job.data;

      const body = `
        ${amountHero(
          `₹${amount.toFixed(2)}`,
          "Payout Amount",
          statusBadge("Payment Sent", "#15803d", "#dcfce7")
        )}

        <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
          Hello <strong>${partnerName}</strong>, your partner payout has been sent successfully.
          It should arrive in your linked bank account or UPI ID within <strong>24 hours</strong>.
        </p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:10px;margin-bottom:24px;border-collapse:collapse;">
          <tr>
            <td style="padding:16px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                ${detailRow("Payment ID", paymentId)}
                ${detailRow("Amount", `₹${amount.toFixed(2)}`)}
                ${detailRow("Expected arrival", "Within 24 hours")}
              </table>
            </td>
          </tr>
        </table>

        <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
          Haven&rsquo;t received the payment after 24 hours? Reach out to us at
          <a href="mailto:${adminEmail}" style="color:${BRAND_COLOR};font-weight:600;text-decoration:none;">${adminEmail}</a>
          and we&rsquo;ll help sort it out right away.
        </p>

        <p style="margin:20px 0 0;font-size:14px;color:#6b7280;">
          Thank you for being a partner with SelloraAI. 🎉
        </p>
      `;

      const mail = await transporter.sendMail({
        from: { name: "SelloraAI", address: process.env.EMAIL_USER! },
        to: partnerEmail,
        subject: `Payout Sent: ₹${amount.toFixed(2)} — SelloraAI`,
        html: emailShell(body),
      });

      console.log("Partner payment email sent:", mail.messageId);
      return;
    }

    // ========================================================
    // NEW SALE (customer + partner)
    // ========================================================
    if (job.name === "payment-success") {
      const { customerName, customerEmail, partnerEmail, productTitle, amount, links } = job.data;

      // ------------------------------------------------------
      // CUSTOMER EMAIL
      // ------------------------------------------------------
      const customerBody = `
        ${amountHero(
          `₹${Number(amount).toFixed(2)}`,
          "Amount Paid",
          statusBadge("Payment Successful", "#15803d", "#dcfce7")
        )}

        <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
          Hi <strong>${customerName}</strong>, thanks for your purchase! Your payment went through
          successfully.

        ${productCard([
          { label: "Product", value: productTitle, emphasis: true },
          { label: "Amount Paid", value: `₹${Number(amount).toFixed(2)}` },
        ])}

    
      `;

      const customerMail = await transporter.sendMail({
        from: { name: "SelloraAI", address: process.env.EMAIL_USER! },
        to: customerEmail,
        subject: `Payment Successful — ${productTitle}`,
        html: emailShell(customerBody),
      });

      console.log("Customer mail response:", customerMail.messageId);

      // ------------------------------------------------------
      // PARTNER EMAIL — price shown first, product info card
      // ------------------------------------------------------
      const partnerRevenue = Number(amount) * 0.95;

      const partnerBody = `
        ${amountHero(
          `₹${Number(amount).toFixed(2)}`,
          "Sale Amount",
          statusBadge("Payment Successful", "#15803d", "#dcfce7")
        )}

        <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
          Congratulations 🎉 You just received a new order on SelloraAI.
        </p>

        ${productCard([
          { label: "Product", value: productTitle, emphasis: true },
          { label: "Sale Amount", value: `₹${Number(amount).toFixed(2)}` },
          { label: "Your Revenue (95%)", value: `₹${partnerRevenue.toFixed(2)}`, emphasis: true },
        ])}

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:10px;margin-bottom:20px;border-collapse:collapse;">
          <tr>
            <td style="padding:16px 20px;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:${BRAND_COLOR};text-transform:uppercase;letter-spacing:0.6px;">
                Customer Details
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                ${detailRow("Name", customerName)}
                ${detailRow("Email", customerEmail)}
              </table>
            </td>
          </tr>
        </table>

        <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
          Your revenue for this sale will be included in your next scheduled payout.
        </p>
      `;

      const partnerMail = await transporter.sendMail({
        from: { name: "SelloraAI", address: process.env.EMAIL_USER! },
        to: partnerEmail,
        subject: `New Sale: ₹${Number(amount).toFixed(2)} — ${productTitle}`,
        html: emailShell(partnerBody),
      });

      console.log("Partner mail response:", partnerMail.messageId);
    }
  },

  {
    connection: redis,
  }
);

emailWorker.on("completed", (job) => {
  console.log("Email sent:", job.id);
});

emailWorker.on("failed", (job, error) => {
  console.log("Email failed:", error);
});