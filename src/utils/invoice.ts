import type { Order } from '../types'
import { formatCurrency } from './formatCurrency'
import { formatDate } from './formatDate'
import { PLACEHOLDER_PRODUCT_IMAGE } from '../hooks/queries'

export function generateInvoiceHtml(order: Order): string {
  const itemsHtml = (order.items || [])
    .map(
      (item, idx) => `
      <tr style="border-bottom: 1px solid #f1f1f1;">
        <td style="padding: 16px 12px; font-weight: 700; color: #111; vertical-align: top; width: 32px;">
          ${idx + 1}
        </td>
        <td style="padding: 16px 12px; vertical-align: top;">
          <div style="display: flex; gap: 14px; align-items: center;">
            <div style="width: 54px; height: 64px; border-radius: 8px; overflow: hidden; background: #f7f7f7; border: 1px solid #eaeaea; flex-shrink: 0;">
              <img 
                src="${item.productImageUrl || PLACEHOLDER_PRODUCT_IMAGE}" 
                alt="${item.productName}"
                style="width: 100%; height: 100%; object-fit: cover;"
                onerror="this.onerror=null;this.src='${PLACEHOLDER_PRODUCT_IMAGE}'"
              />
            </div>
            <div>
              <div style="font-weight: 800; font-size: 14px; color: #111111; margin-bottom: 4px;">
                ${item.productName}
              </div>
              <div style="font-size: 12px; color: #666666; font-weight: 500;">
                Color: <span style="color: #111; font-weight: 600;">${item.colorName}</span> &nbsp;|&nbsp; 
                Size: <span style="color: #111; font-weight: 700;">${item.sizeCode || item.sizeName}</span>
              </div>
              <div style="font-size: 11px; color: #888888; margin-top: 3px;">
                Unit Price: ${formatCurrency(item.unitPrice)}
              </div>
            </div>
          </div>
        </td>
        <td style="padding: 16px 12px; text-align: center; vertical-align: middle; font-size: 13px; font-weight: 700; color: #111;">
          ${item.quantity}
        </td>
        <td style="padding: 16px 12px; text-align: right; vertical-align: middle; font-size: 14px; font-weight: 800; color: #111;">
          ${formatCurrency(item.unitPrice * item.quantity)}
        </td>
      </tr>
    `
    )
    .join('')

  const subtotal = (order.items || []).reduce(
    (acc, it) => acc + it.unitPrice * it.quantity,
    0
  )

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice #${order.orderNumber} — KAIIRA</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
      color: #111111;
      padding: 40px;
      line-height: 1.5;
    }
    .invoice-container {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
    }
    .brand-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #111111;
      padding-bottom: 24px;
      margin-bottom: 30px;
    }
    .brand-logo {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: -0.05em;
      text-transform: uppercase;
      color: #000000;
      line-height: 1;
    }
    .brand-tagline {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #666666;
      margin-top: 6px;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-title {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.02em;
      text-transform: uppercase;
      color: #111111;
    }
    .invoice-id {
      font-size: 14px;
      font-weight: 700;
      color: #555555;
      margin-top: 2px;
    }
    .status-badge {
      display: inline-block;
      margin-top: 6px;
      padding: 4px 12px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      border-radius: 9999px;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 32px;
    }
    .info-box-title {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #888888;
      margin-bottom: 8px;
    }
    .info-box-content {
      font-size: 13px;
      font-weight: 500;
      color: #222222;
      line-height: 1.6;
    }
    .info-box-name {
      font-weight: 800;
      font-size: 14px;
      color: #111111;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
    }
    th {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #666666;
      border-bottom: 2px solid #111111;
      padding: 12px;
    }
    .totals-area {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 32px;
    }
    .totals-table {
      width: 320px;
      font-size: 13px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      color: #555555;
      font-weight: 600;
    }
    .totals-row.final {
      border-top: 2px solid #111111;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 18px;
      font-weight: 900;
      color: #111111;
    }
    .terms-box {
      border-radius: 12px;
      border: 1px solid #e5e5e5;
      background: #fafafa;
      padding: 16px 20px;
      margin-bottom: 32px;
    }
    .terms-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #111111;
      margin-bottom: 4px;
    }
    .terms-text {
      font-size: 11px;
      color: #666666;
      line-height: 1.6;
    }
    .invoice-footer {
      border-top: 1px solid #eaeaea;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #777777;
      font-weight: 500;
    }
    .print-button {
      background: #111111;
      color: #ffffff;
      border: none;
      border-radius: 9999px;
      padding: 10px 24px;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 24px;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="no-print" style="text-align: right;">
      <button class="print-button" onclick="window.print()">
        🖨️ Print / Save as PDF
      </button>
    </div>

    <!-- Header -->
    <div class="brand-header">
      <div>
        <div class="brand-logo">KAIIRA</div>
        <div class="brand-tagline">Heavyweight Apparel Studio</div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-title">Tax Invoice</div>
        <div class="invoice-id">#${order.orderNumber}</div>
        <div class="status-badge">${order.paymentStatus === 'PAID' ? 'PAID & CONFIRMED' : 'PAYMENT PENDING'}</div>
      </div>
    </div>

    <!-- Order & Customer Details -->
    <div class="info-grid">
      <div>
        <div class="info-box-title">Billed & Shipped To</div>
        <div class="info-box-content">
          <div class="info-box-name">${order.customerName}</div>
          <div>${order.customerEmail}</div>
          <div>Phone: ${order.customerPhone}</div>
          <div style="margin-top: 4px; color: #444;">${order.shippingAddress}</div>
        </div>
      </div>

      <div style="text-align: right;">
        <div class="info-box-title">Order Information</div>
        <div class="info-box-content">
          <div><strong style="color: #111;">Order Date:</strong> ${formatDate(order.createdAt)}</div>
          <div><strong style="color: #111;">Payment Method:</strong> Prepaid Online (Razorpay)</div>
          <div><strong style="color: #111;">Shipping:</strong> Express Courier Delivery</div>
          <div><strong style="color: #111;">Support Email:</strong> hello.kaiiraofficial@gmail.com</div>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th style="text-align: left; width: 32px;">#</th>
          <th style="text-align: left;">Item Description</th>
          <th style="text-align: center; width: 80px;">Qty</th>
          <th style="text-align: right; width: 140px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-area">
      <div class="totals-table">
        <div class="totals-row">
          <span>Items Subtotal</span>
          <span style="color: #111; font-weight: 700;">${formatCurrency(subtotal)}</span>
        </div>
        <div class="totals-row">
          <span>Shipping & Delivery</span>
          <span style="color: #059669; font-weight: 700;">FREE</span>
        </div>
        <div class="totals-row">
          <span>GST / Taxes</span>
          <span style="color: #777;">Included</span>
        </div>
        <div class="totals-row final">
          <span>Total Paid</span>
          <span>${formatCurrency(order.totalAmount)}</span>
        </div>
      </div>
    </div>

    <!-- Policy & Notes -->
    <div class="terms-box">
      <div class="terms-title">7-Day Exchange Policy Notice</div>
      <div class="terms-text">
        All KAIIRA garments are crafted with heavyweight premium cotton. We provide a <strong>7-Day Exchange Policy</strong> for size or color replacements on all unworn items with intact studio tags. Please note that monetary returns/refunds are not offered.
        <br />
        For any exchange requests or support inquiries, contact us directly at <strong>hello.kaiiraofficial@gmail.com</strong> quoting your Order #${order.orderNumber}.
      </div>
    </div>

    <!-- Footer -->
    <div class="invoice-footer">
      <div>KAIIRA APPAREL INC. • Crafted For Longevity</div>
      <div>hello.kaiiraofficial@gmail.com</div>
    </div>
  </div>
</body>
</html>`
}

export function openPrintableInvoice(order: Order) {
  const html = generateInvoiceHtml(order)
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  } else {
    // If popup blocked, create blob and download
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Invoice-${order.orderNumber}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
