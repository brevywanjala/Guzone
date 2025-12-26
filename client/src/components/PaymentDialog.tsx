import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Phone, Mail, MapPin, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ordersApi, Order } from "@/apiRoutes";
import { customersApi } from "@/apiRoutes";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onOrderComplete: () => void;
}

export function PaymentDialog({ open, onOpenChange, order, onOrderComplete }: PaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (order && open) {
      setShippingAddress(order.shipping_address);
      // Fetch customer profile to get default address if needed
      fetchCustomerAddress();
    }
  }, [order, open]);

  const fetchCustomerAddress = async () => {
    try {
      const customer = await customersApi.getProfile();
      if (customer.address && !shippingAddress) {
        const fullAddress = [
          customer.address,
          customer.city,
          customer.state,
          customer.zip_code,
          customer.country
        ].filter(Boolean).join(", ");
        setShippingAddress(fullAddress || customer.address || "");
      }
    } catch (error) {
      // Silently fail - use order's shipping address
    }
  };

  const mpesaPaybill = "123456";
  const accountNumber = order?.order_number || "";
  const contactPhone = "+254 700 000 000";
  const contactEmail = "support@greateasttrade.com";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleComplete = async () => {
    if (!order) return;

    if (!shippingAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a delivery address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Customer confirms payment - updates order status to pending
      // Also update shipping address if changed
      await ordersApi.completeOrder(order.id, shippingAddress);

      toast({
        title: "Order Confirmed",
        description: "Your order has been submitted and is pending payment confirmation.",
      });

      onOrderComplete();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to complete order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Payment Information</DialogTitle>
          <DialogDescription>
            Complete your payment using M-Pesa Paybill
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Order Summary */}
          <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Order Number:
                </span>
                <Badge variant="outline" className="font-mono">
                  {order.order_number}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Amount:
                </span>
                <span className="text-lg font-bold text-blue-600">
                  ${(order.total_amount ?? 0).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* M-Pesa Payment Instructions */}
          <Card className="border border-gray-200 dark:border-slate-700">
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-600" />
                M-Pesa Paybill Payment
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Paybill Number:
                    </span>
                    <div className="flex items-center gap-2">
                      <code className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                        {mpesaPaybill}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopy(mpesaPaybill, "Paybill number")}
                      >
                        {copied === "Paybill number" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Account Number:
                    </span>
                    <div className="flex items-center gap-2">
                      <code className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                        {accountNumber}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopy(accountNumber, "Account number")}
                      >
                        {copied === "Account number" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Amount:
                    </span>
                    <code className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                      ${(order.total_amount ?? 0).toFixed(2)}
                    </code>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Instructions:</strong> Go to M-Pesa on your phone, select "Pay Bill", 
                    enter the Paybill number <strong>{mpesaPaybill}</strong>, Account Number <strong>{accountNumber}</strong>, 
                    and Amount <strong>${(order.total_amount ?? 0).toFixed(2)}</strong>. Complete the transaction.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border border-gray-200 dark:border-slate-700">
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${contactPhone}`}
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600"
                      >
                        {contactPhone}
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopy(contactPhone, "Phone number")}
                      >
                        {copied === "Phone number" ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${contactEmail}`}
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 truncate"
                      >
                        {contactEmail}
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopy(contactEmail, "Email")}
                      >
                        {copied === "Email" ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="shipping-address" className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                      Delivery Address
                    </Label>
                    <Input
                      id="shipping-address"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Enter delivery address"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complete Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              onClick={handleComplete}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  I Have Completed Payment
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="sm:w-auto px-6 py-6"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

