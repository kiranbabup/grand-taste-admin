import "./OrderPrint.css"

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const generateReceipt = (logo, orderData, poweredBy, gstNumber, companyName) => {

  return `
        <div style="width: 210mm; min-height: 297mm; margin: auto; font-family: 'Segoe UI', Roboto, sans-serif; color: #1e293b; padding: 20px; background: white; box-sizing: border-box;">

            <!-- Header Section -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 4px solid #0f766e; padding-bottom: 5px; margin-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${logo}" alt="Logo" style="width: 100px; height: 100px; object-fit: cover;" />
                    <div>
                        <h1 style="margin: 0; font-size: 30px; font-weight: 800; color: #0f766e; letter-spacing: -0.025em;">${companyName}</h1>
                        <p style="margin: 4px 0; font-size: 16px; font-weight: 600; color: #64748b;">GSTIN: ${gstNumber}</p>
                        <p style="margin: 2px 0; font-size: 14px; color: #94a3b8;">Powered by: <span style="color: #0f766e; font-weight: 600;">${poweredBy}</span></p>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="background: #0f766e; color: white; padding: 4px 10px; border-radius: 6px; display: inline-block; font-weight: 500; font-size: 15px; margin-bottom: 10px;">TAX INVOICE</div>
                    <p style="margin: 0; font-size: 14px; color: #64748b;">Invoice Date: <span style="color: #1e293b; font-weight: 600;">${formatDate(orderData.createdAt)}</span></p>
                    <p style="margin: 4px 0; font-size: 14px; color: #64748b;">Invoice No: <span style="color: #1e293b; font-weight: 600;">${orderData.orderId}</span></p>
                </div>
            </div>

            <!-- Details Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <h3 style="margin: 0 0 15px; font-size: 16px; font-weight: 700; color: #0f766e; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #0f766e; display: inline-block; padding-bottom: 4px;">Billing Details</h3>
                    <div style="display: grid; gap: 8px;">
                        <p style="margin: 0; font-size: 15px;"><strong>Customer Name:</strong> ${orderData?.shippingAddress?.name}</p>
                        <p style="margin: 0; font-size: 15px;"><strong>Phone:</strong> ${orderData?.shippingAddress?.phone}</p>
                        <p style="margin: 0; font-size: 15px;"><strong>Address:</strong>
                        <br/>
                            ${orderData.shippingAddress?.h_no ? `
                                ${orderData.shippingAddress.h_no}, ${orderData.shippingAddress.street}
                                <br/>
                                ${orderData.shippingAddress.landmark ? `${orderData.shippingAddress.landmark}, ` : ''}${orderData.shippingAddress.city}
                                <br/>
                                ${orderData.shippingAddress.state} - ${orderData.shippingAddress.pincode}
                            ` : 'N/A'}
                        </p>
                    </div>
                </div>

                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <h3 style="margin: 0 0 15px; font-size: 16px; font-weight: 700; color: #0f766e; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #0f766e; display: inline-block; padding-bottom: 4px;">Order Status</h3>
                    <div style="display: grid; gap: 8px;">
                        <p style="margin: 0; font-size: 15px;"><strong>Payment Method:</strong> ${orderData.paymentMethod}</p>
                        <p style="margin: 0; font-size: 15px;"><strong>Payment Status:</strong> ${orderData.paymentStatus}</p>
                        ${orderData.assignedEmployee ? `<p style="margin: 0; font-size: 15px;"><strong>Assigned Agent:</strong> ${orderData.assignedEmployee.name}</p>` : ''}
                        <p style="margin: 0; font-size: 15px;"><strong>Agent Phone:</strong> ${orderData.assignedEmployee?.phone}</p>
                        <p style="margin: 0; font-size: 15px;"><strong>Agent Code:</strong> ${orderData.assignedEmployee?.referalcode}</p>
                    </div>
                </div>
            </div>

            <!-- Items Table -->
            <div style="margin-bottom: 5px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead>
                        <tr style="background: #0f766e; color: white;">
                            <th style="padding: 12px 15px; text-align: left; border-top-left-radius: 8px;">Item Description</th>
                            <th style="padding: 12px 15px; text-align: center;">HSN Code</th>
                            <th style="padding: 12px 15px; text-align: center;">Qty</th>
                            <th style="padding: 12px 15px; text-align: right;">Selling Price</th>
                            <th style="padding: 12px 15px; text-align: center;">GST %</th>
                            <th style="padding: 12px 15px; text-align: right; border-top-right-radius: 8px;">Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderData.orderItems.map((item, index) => `
                            <tr style="border-bottom: 1px solid #e2e8f0; ${index % 2 === 0 ? '' : 'background: #f8fafc;'}">
                                <td style="padding: 15px;">
                                    <div style="font-weight: 700; color: #0f766e; font-size: 15px;">${item.productname}</div>
                                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Category: ${item.category}</div>
                                </td>
                                <td style="padding: 15px; text-align: center; color: #64748b;">${item.hsncode || '---'}</td>
                                <td style="padding: 15px; text-align: center; font-weight: 600;">${item.qty} ${item.unit || 'pcs'}</td>
                                <td style="padding: 15px; text-align: right;">₹${parseFloat(item.sellingPrice).toFixed(2)}</td>
                                <td style="padding: 15px; text-align: center;">${item.gstpercentage}%</td>
                                <td style="padding: 15px; text-align: right; font-weight: 700;">₹${(item.qty * item.sellingPrice).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Summary Section -->
            <div style="display: flex; justify-content: space-between;">
                <div style="width: 350px;">
                    <div style="display: flex; justify-content: start; gap: 15px; margin-bottom: 12px; font-size: 15px;">
                        <span style="color: #64748b; font-weight: 600;">Total Items:</span>
                        <span style="font-weight: 700;">${orderData?.orderItems.length}</span>
                    </div>
                    <div style="display: flex; justify-content: start; gap: 15px; margin-bottom: 12px; font-size: 15px;">
                        <span style="color: #64748b; font-weight: 600;">Total Quantity:</span>
                        <span style="font-weight: 700;">${orderData?.totalQty || orderData?.orderItems.reduce((acc, i) => acc + i.qty, 0)}</span>
                    </div>
                </div>
                <div style="width: 350px; padding: 10px; border-radius: 12px; border: 2px solid #0f766e;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px;">
                        <span style="color: #64748b; font-weight: 600;">Total Tax (GST):</span>
                        <span style="font-weight: 700;">₹${parseFloat(orderData?.totalGstAmount).toFixed(2)}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 20px; font-weight: 800; color: #0f766e;">Grand Total:</span>
                        <span style="font-size: 24px; font-weight: 800; color: #0f766e;">₹${parseFloat(orderData?.totalPrice).toFixed(2)}</span>
                    </div>
                    <p style="font-size: 11px; color: #94a3b8; text-align: right; font-style: italic;">*All prices are inclusive of GST</p>
                </div>
            </div>

            <!-- Footer Section -->
            <div style="margin-top: 5px; text-align: center; border-top: 2px dashed #cbd5e1; padding-top: 5px;">
                <h2 style="margin: 0; color: #0f766e; font-size: 20px; font-weight: 700;">Thank You for Your Order!</h2>
                <p style="margin: 8px 0; color: #64748b; font-size: 14px;">Please visit us again @ <strong>${companyName}</strong></p>
                <div style="margin-top: 5px; font-size: 12px; color: #94a3b8;">
                    This is a computer generated invoice and does not require a physical signature.
                </div>
            </div>
        </div>
    `;
};

export const handlePrint = (receiptData, externalWindow) => {
  // For A4, we need a larger window
  const printWindow = externalWindow || window.open('', '', 'width=900,height=900');

  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice - Grand Taste</title>
        <style>
          @media print {
            @page {
              size: A4 portrait;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
            }
          }
          body {
            margin: 0;
            padding: 0;
            background-color: #f1f5f9;
          }
          * {
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: center; align-items: flex-start; min-height: 100vh;">
          ${receiptData}
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };
};

