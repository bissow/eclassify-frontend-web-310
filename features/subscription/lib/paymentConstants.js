import StripeLogo from "@/public/assets/ic_stripe.png";
import RazorpayLogo from "@/public/assets/ic_razorpay.png";
import PaystackLogo from "@/public/assets/ic_paystack.png";
import FlutterwaveLogo from "@/public/assets/flutterwave.png";
import PhonePeLogo from "@/public/assets/phonepe-icon.png";
import PaypalLogo from "@/public/assets/paypal-logo.png";
import PaytabsLogo from "@/public/assets/paytabs.webp";
import DpoLogo from "@/public/assets/dpoPay.webp";
import CashfreeLogo from "@/public/assets/cashfree.png";
import PayuLogo from "@/public/assets/payu.png";

export const PAYMENT_METHODS = [
    { id: "stripe", label: "stripe", icon: StripeLogo, settingsKey: "Stripe" },
    { id: "razorpay", label: "razorPay", icon: RazorpayLogo, settingsKey: "Razorpay" },
    { id: "paystack", label: "payStack", icon: PaystackLogo, settingsKey: "Paystack" },
    { id: "flutterwave", label: "flutterwave", icon: FlutterwaveLogo, settingsKey: "flutterwave" },
    { id: "phonepe", label: "phonepe", icon: PhonePeLogo, settingsKey: "PhonePe" },
    { id: "paypal", label: "paypal", icon: PaypalLogo, settingsKey: "Paypal" },
    { id: "paytabs", label: "paytabs", icon: PaytabsLogo, settingsKey: "Paytabs" },
    { id: "dpo", label: "dpoPay", icon: DpoLogo, settingsKey: "DPO" },
    { id: "cashfree", label: "cashfree", icon: CashfreeLogo, settingsKey: "cashfree-payment-gateway" },
    { id: "payu", label: "payu", icon: PayuLogo, settingsKey: "payu-india-payment-gateway" },
];

export const GATEWAY_CONFIGS = {
    razorpay: { intentMethod: "Razorpay", urlPath: null },
    paystack: { intentMethod: "Paystack", urlPath: "payment_gateway_response.data.authorization_url" },
    flutterwave: { intentMethod: "FlutterWave", urlPath: "payment_gateway_response.data.link" },
    phonepe: { intentMethod: "PhonePe", urlPath: "payment_gateway_response.payment_gateway_response" },
    paypal: { intentMethod: "PayPal", urlPath: "approval_url" },
    paytabs: { intentMethod: "Paytabs", urlPath: "payment_url" },
    dpo: { intentMethod: "DPO", urlPath: "payment_url" },
    cashfree: { intentMethod: "cashfree-payment-gateway", urlPath: "payment_url" },
    payu: { intentMethod: "payu-india-payment-gateway", urlPath: "payment_url" },
};