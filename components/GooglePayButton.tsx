"use client";

import { useEffect, useState, useCallback } from "react";
import { useCart } from "@/components/cart-provider";
import type { CheckoutDraftInput } from "@/components/ExpressCheckout";

declare global {
  interface Window {
    google?: any;
    paypal?: any;
  }
}

interface GooglePayButtonProps {
  onSuccess: (orderId: string) => void;
  onError: (message: string) => void;
  checkoutData: CheckoutDraftInput;
  disabled: boolean;
}

const baseRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,
};

export default function GooglePayButton({ onSuccess, onError, checkoutData, disabled }: GooglePayButtonProps) {
  const { items, subtotal, shipping, total } = useCart();
  const [isEligible, setIsEligible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentsClient, setPaymentsClient] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    const checkEligibility = async () => {
      if (!window.google?.payments?.api?.PaymentsClient || !window.paypal?.Googlepay) {
        return;
      }

      try {
        const googlePayConfig = await window.paypal.Googlepay().config();
        const client = new window.google.payments.api.PaymentsClient({
          environment: process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT === "production" ? "PRODUCTION" : "TEST",
          paymentDataCallbacks: {
            onPaymentAuthorized: (paymentData: any) => processPayment(paymentData),
          },
        });

        const isReadyToPayRequest = {
          ...baseRequest,
          allowedPaymentMethods: googlePayConfig.allowedPaymentMethods,
        };

        const response = await client.isReadyToPay(isReadyToPayRequest);
        if (!cancelled && response.result) {
          setPaymentsClient(client);
          setIsEligible(true);
        }
      } catch {
        // Google Pay not eligible
      }
    };

    checkEligibility();
    return () => {
      cancelled = true;
    };
  }, []);

  const processPayment = useCallback(
    async (paymentData: any) => {
      try {
        // Create order on server
        const orderId = `ts-${Date.now()}`;
        const createResponse = await fetch("/api/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
            currency: "MXN",
            orderId,
            ...checkoutData,
          }),
        });

        if (!createResponse.ok) {
          throw new Error("No se pudo crear la orden");
        }

        const createData = await createResponse.json();
        const paypalOrderId = createData.id || orderId;

        // Confirm order with Google Pay
        const confirmResult = await window.paypal.Googlepay().confirmOrder({
          orderId: paypalOrderId,
          paymentMethodData: paymentData.paymentMethodData,
          email: paymentData.email,
          shippingAddress: paymentData.shippingAddress,
        });

        if (confirmResult.status === "PAYER_ACTION_REQUIRED") {
          await window.paypal.Googlepay().initiatePayerAction({ orderId: paypalOrderId });
        }

        if (confirmResult.status !== "APPROVED" && confirmResult.status !== "PAYER_ACTION_REQUIRED") {
          throw new Error("El pago no fue aprobado");
        }

        // Capture order
        const captureResponse = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: paypalOrderId }),
        });

        if (!captureResponse.ok) {
          throw new Error("No se pudo capturar el pago");
        }

        onSuccess(paypalOrderId);
        return { transactionState: "SUCCESS" };
      } catch (err) {
        onError(err instanceof Error ? err.message : "Error en el pago con Google Pay");
        return {
          transactionState: "ERROR",
          error: {
            intent: "PAYMENT_AUTHORIZATION",
            message: err instanceof Error ? err.message : "Transaction failed",
          },
        };
      }
    },
    [checkoutData, items, onSuccess, onError],
  );

  const handleClick = useCallback(async () => {
    if (!paymentsClient || !window.paypal?.Googlepay) return;

    setLoading(true);
    try {
      const googlePayConfig = await window.paypal.Googlepay().config();

      const paymentDataRequest = {
        ...baseRequest,
        allowedPaymentMethods: googlePayConfig.allowedPaymentMethods,
        merchantInfo: googlePayConfig.merchantInfo,
        transactionInfo: {
          currencyCode: "MXN",
          totalPriceStatus: "FINAL",
          totalPrice: total.toFixed(2),
        },
        callbackIntents: ["PAYMENT_AUTHORIZATION"],
        emailRequired: true,
        shippingAddressRequired: true,
      };

      await paymentsClient.loadPaymentData(paymentDataRequest);
    } catch (err) {
      if ((err as any)?.statusCode !== "CANCELED") {
        onError(err instanceof Error ? err.message : "No se pudo iniciar Google Pay");
      }
    } finally {
      setLoading(false);
    }
  }, [paymentsClient, total, onError]);

  if (!isEligible) return null;

  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={handleClick}
        disabled={disabled || loading || items.length === 0}
        style={{
          width: "100%",
          height: 48,
          backgroundColor: "#fff",
          color: "#1f1f1f",
          border: "1px solid #dadce0",
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 500,
          cursor: loading ? "wait" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          opacity: disabled || items.length === 0 ? 0.5 : 1,
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        }}
        aria-label="Pagar con Google Pay"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
          <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
        </svg>
        {loading ? "Procesando..." : "Pagar con Google Pay"}
      </button>
    </div>
  );
}
