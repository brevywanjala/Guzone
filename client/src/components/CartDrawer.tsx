import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { LoginModal } from "./LoginModal";
import { PaymentDialog } from "./PaymentDialog";
import { ordersApi, Order } from "@/apiRoutes";
import { useToast } from "@/hooks/use-toast";
import { customersApi } from "@/apiRoutes";

export function CartDrawer() {
  const { items, totalItems, totalPrice, removeFromCart, updateQuantity, clearCart } =
    useCart();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setOpen(false);
      setShowLogin(true);
      return;
    }

    // User is logged in, create order and show payment dialog
    await createOrderAndShowPayment();
  };

  const createOrderAndShowPayment = async () => {
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get customer profile for shipping address
      let shippingAddress = "Address to be confirmed";
      try {
        // Verify token is available before making request
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token available");
        }
        
        const customer = await customersApi.getProfile();
        shippingAddress = customer.address || customer.city || customer.state || "Address to be confirmed";
      } catch (profileError: any) {
        // If profile doesn't exist or error, use default address
        console.warn("Could not fetch customer profile:", profileError);
        // If it's an auth error, don't continue
        if (profileError.response?.status === 401 || profileError.response?.status === 422) {
          throw profileError; // Re-throw to be handled by outer catch
        }
        // Continue with default address for other errors
      }
      
      // Convert cart items to order items
      // Note: Assuming product IDs are numeric strings that can be converted
      const orderItems = items.map((item) => ({
        product_id: parseInt(item.id) || 0, // Convert string ID to number
        quantity: item.quantity,
      }));

      // Filter out items with invalid product IDs
      const validItems = orderItems.filter(item => item.product_id > 0);
      
      if (validItems.length === 0) {
        toast({
          title: "Error",
          description: "Some products in your cart are invalid. Please refresh and try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Create order
      const order = await ordersApi.createOrder({
        items: validItems,
        shipping_address: shippingAddress,
        payment_method: "M-Pesa",
      });

      // Validate order has required fields
      if (!order || order.total_amount === undefined || order.total_amount === null) {
        console.error("Order created but missing total_amount:", order);
        toast({
          title: "Error",
          description: "Order was created but is missing required information. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setCurrentOrder(order);
      setOpen(false);
      setShowPayment(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to create order";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // If it's a 422 or 401, might be token issue - redirect to login
      if (error.response?.status === 422 || error.response?.status === 401) {
        setTimeout(() => {
          setShowLogin(true);
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = async () => {
    setShowLogin(false);
    // Wait a bit for token to be stored in localStorage and state to update
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Verify token is available before proceeding
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token not found. Please try logging in again.",
        variant: "destructive",
      });
      setShowLogin(true);
      return;
    }
    
    console.log("Token verified before creating order, length:", token.length);
    // After login, create order and show payment
    await createOrderAndShowPayment();
  };

  const handleOrderComplete = () => {
    clearCart();
    setCurrentOrder(null);
    toast({
      title: "Order Submitted",
      description: "Your order has been submitted successfully!",
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {totalItems}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {t("cart")} ({totalItems} {t("items")})
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full pt-6">
            {items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                {t("emptyCart")}
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 border rounded-lg"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-sm">{item.name}</h3>
                        <p className="text-sm font-bold text-primary">
                          ${item.price} × {item.quantity}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                Math.max(item.minOrder, item.quantity - item.minOrder)
                              )
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm w-12 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + item.minOrder)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 ml-auto"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t("total")}:</span>
                    <span className="text-primary">${totalPrice.toFixed(2)}</span>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : t("proceedToCheckout")}
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <LoginModal 
        open={showLogin} 
        onOpenChange={setShowLogin}
        onLoginSuccess={handleLoginSuccess}
        skipRedirect={true}
      />
      <PaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        order={currentOrder}
        onOrderComplete={handleOrderComplete}
      />
      
    </>
  );
}
