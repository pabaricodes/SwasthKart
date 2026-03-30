import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { logger } from "../utils/logger";

const router = Router();

router.get("/:paymentId", async (req: Request, res: Response) => {
  const { paymentId } = req.params;

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) {
    res.status(404).send("Payment not found");
    return;
  }

  if (payment.status !== "INITIATED") {
    res.status(400).send("Payment already processed");
    return;
  }

  const amountRupees = (payment.amountPaise / 100).toFixed(2);

  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>SwasthKart Mock Payment</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
    .card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
    .amount { font-size: 2rem; font-weight: bold; color: #16a34a; margin: 16px 0; }
    .spinner { border: 4px solid #e5e7eb; border-top: 4px solid #16a34a; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .status { color: #6b7280; margin-top: 12px; }
    .result { font-size: 1.2rem; font-weight: 600; margin-top: 16px; }
    .success { color: #16a34a; }
    .failed { color: #dc2626; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Mock Payment Gateway</h2>
    <div class="amount">₹${amountRupees}</div>
    <div id="processing">
      <div class="spinner"></div>
      <p class="status">Processing payment...</p>
    </div>
    <div id="result" style="display:none"></div>
  </div>
  <script>
    setTimeout(async () => {
      const success = Math.random() < 0.98;
      const status = success ? "SUCCESS" : "FAILED";
      const providerRef = "MOCK_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

      try {
        await fetch("/v1/payments/webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payment_id: "${paymentId}",
            status: status,
            provider_ref: providerRef,
            timestamp: new Date().toISOString()
          })
        });
      } catch (e) {
        console.error("Webhook call failed", e);
      }

      document.getElementById("processing").style.display = "none";
      const resultDiv = document.getElementById("result");
      resultDiv.style.display = "block";
      if (success) {
        resultDiv.innerHTML = '<p class="result success">Payment Successful ✓</p><p class="status">Redirecting...</p>';
      } else {
        resultDiv.innerHTML = '<p class="result failed">Payment Failed ✗</p><p class="status">Redirecting...</p>';
      }

      setTimeout(() => {
        window.location.href = "/payment-result?payment_id=${paymentId}&status=" + status;
      }, 1500);
    }, 2000);
  </script>
</body>
</html>`);
});

export { router as mockPaymentRouter };
