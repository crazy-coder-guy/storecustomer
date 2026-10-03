import type { Order } from '../types'
import { formatCurrency } from './formatCurrency'
import { formatDate } from './formatDate'
import { PLACEHOLDER_PRODUCT_IMAGE } from '../hooks/queries'

function generateBarcodeSvg(text: string): string {
  // Code 39 barcode encoding mapping
  const CODE39_MAP: Record<string, string> = {
    '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
    '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
    '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
    'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
    'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
    'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
    'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
    'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
    'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
    '-': '010000101', '*': '010010100'
  }

  const cleanVal = text.toUpperCase().replace(/[^A-Z0-9-]/g, '') || 'ORD'
  const fullPattern = `*${cleanVal}*`
  
  let x = 0
  const narrowWidth = 1.6
  const wideWidth = 4.2
  const barHeight = 34
  let paths = ''

  for (let i = 0; i < fullPattern.length; i++) {
    const char = fullPattern[i]
    const pattern = CODE39_MAP[char] || CODE39_MAP['-']
    for (let j = 0; j < 9; j++) {
      const isBar = j % 2 === 0
      const width = pattern[j] === '1' ? wideWidth : narrowWidth
      if (isBar) {
        paths += `<rect x="${x.toFixed(1)}" y="0" width="${width.toFixed(1)}" height="${barHeight}" fill="#111111" />`
      }
      x += width
    }
    x += narrowWidth // Inter-character gap
  }

  return `<svg viewBox="0 0 ${x.toFixed(1)} ${barHeight}" xmlns="http://www.w3.org/2000/svg" style="height: 34px; width: auto; max-width: 170px; display: inline-block;">
    ${paths}
  </svg>`
}

export function generateInvoiceHtml(order: Order): string {
  const itemsHtml = (order.items || [])
    .map(
      (item, idx) => `
      <tr style="border-bottom: 1px solid #f1f1f1; page-break-inside: avoid; break-inside: avoid;">
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
                ${item.colorName ? `Color: <span style="color: #111; font-weight: 600;">${item.colorName}</span> &nbsp;|&nbsp; ` : ''}Size: <span style="color: #111; font-weight: 700;">${item.sizeCode || item.sizeName}</span>
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

  const barcodeSvg = generateBarcodeSvg(order.orderNumber || order.id || 'KAIIRA')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice — KAIIRA</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
      color: #111111;
      padding: 40px;
      line-height: 1.5;
    }
    .invoice-container {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      position: relative;
    }
    .brand-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #111111;
      padding-bottom: 20px;
      margin-bottom: 30px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #111111;
    }
    .invoice-status {
      font-size: 12px;
      font-weight: 700;
      color: #059669;
      margin-top: 2px;
      margin-bottom: 6px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 32px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .info-box-title {
      font-size: 12px;
      font-weight: 800;
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
    thead {
      display: table-header-group;
    }
    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    th {
      font-size: 12px;
      font-weight: 800;
      color: #666666;
      border-bottom: 2px solid #111111;
      padding: 12px;
    }
    .totals-area {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 32px;
      page-break-inside: avoid;
      break-inside: avoid;
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
      margin-top: 24px;
      margin-bottom: 32px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .terms-title {
      font-size: 12px;
      font-weight: 800;
      color: #111111;
      margin-bottom: 6px;
    }
    .terms-text {
      font-size: 11px;
      color: #555555;
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
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .print-button {
      background: #111111;
      color: #ffffff;
      border: none;
      border-radius: 9999px;
      padding: 10px 24px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 24px;
      transition: background 0.2s ease;
    }
    .print-button:hover {
      background: #333333;
    }
    @media print {
      @page {
        margin: 12mm 15mm;
        size: auto;
      }
      body {
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
      tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      thead {
        display: table-header-group !important;
      }
      .totals-area, .terms-box, .invoice-footer, .brand-header, .info-grid {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="no-print" style="text-align: right;">
      <button class="print-button" onclick="window.print()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        <span>Print / Save as PDF</span>
      </button>
    </div>

    <!-- Header -->
    <div class="brand-header">
      <div>
        <svg viewBox="0 0 236 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="height: 32px; width: auto; color: #000000;" aria-label="Kaiira Logo">
          <path d="M10 8V36M32 8L11 22L32 36" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M48 36L64 8L80 36" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M96 8V36" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" />
          <path d="M112 8V36" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" />
          <path d="M128 36V8H148C158 8 158 22 148 22H128M141 22C148 22 153 27 157 36" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M172 36L188 8L204 36" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div class="invoice-meta">
        <div class="invoice-title">Tax Invoice</div>
        <div class="invoice-status">Status: ${order.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}</div>
        <div style="margin-top: 6px;">
          ${barcodeSvg}
        </div>
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
          <span style="color: #059669; font-weight: 700;">Free</span>
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
      <div class="terms-title">KAIIRA – Terms & Conditions</div>
      <div class="terms-text">
        All orders are subject to KAIIRA’s terms and policies. Goods once sold will be eligible for return or exchange only as per KAIIRA’s Return and Exchange Policy. Customers are requested to check the product details, size, color, and other information before placing an order. Products must be returned in their original condition, unused, unwashed, and with all original tags and packaging intact. Return or exchange requests must be raised within the time period specified in KAIIRA’s Return and Exchange Policy. Products damaged due to improper use, washing, or handling may not be eligible for return or exchange. Refunds, where applicable, will be processed according to KAIIRA’s refund policy. KAIIRA reserves the right to accept or reject return and exchange requests based on the applicable policy. Shipping and return charges, where applicable, will be handled according to the respective policy.
      </div>
    </div>

    <!-- Footer -->
    <div class="invoice-footer">
      <div>KAIIRA • Crafted For Longevity</div>
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
    link.download = `Invoice.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
