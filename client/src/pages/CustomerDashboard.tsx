import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Package, 
  ShoppingBag, 
  Truck, 
  User, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  DollarSign,
  Calendar,
  CreditCard,
  Menu
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { customersApi, Order, authApi } from "@/apiRoutes";
import { PaymentDialog } from "@/components/PaymentDialog";

export default function CustomerDashboard() {
  const { user, token, logout, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [profileData, setProfileData] = useState({
    phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
  });

  useEffect(() => {
    // Wait for auth state to finish loading before checking authentication
    if (isLoading) {
      return;
    }

    // Check localStorage directly as a fallback
    const storedToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");
    
    if (!isAuthenticated && (!storedToken || !storedUser)) {
      navigate("/");
      return;
    }
    
    // Only fetch data if authenticated
    if (isAuthenticated || (storedToken && storedUser)) {
      checkProfileAndFetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading, navigate]);

  const checkProfileAndFetchOrders = async () => {
    if (!token) return;

    try {
      // Check if profile is complete
      const profileCheck = await authApi.checkProfileComplete();
      setIsProfileComplete(profileCheck.is_complete);
      if (!profileCheck.is_complete) {
        setProfileDialogOpen(true);
        // Pre-fill with existing data if available
        if (profileCheck.customer) {
          setProfileData({
            phone: profileCheck.customer.phone || "",
            address: profileCheck.customer.address || "",
            city: profileCheck.customer.city || "",
            state: profileCheck.customer.state || "",
            zip_code: profileCheck.customer.zip_code || "",
            country: profileCheck.customer.country || "",
          });
        }
      }
      
      // Fetch orders regardless
      const data = await customersApi.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error checking profile or fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      await customersApi.updateProfile(profileData);
      // Re-check profile to ensure it's complete
      const profileCheck = await authApi.checkProfileComplete();
      setIsProfileComplete(profileCheck.is_complete);
      
      if (profileCheck.is_complete) {
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
        setProfileDialogOpen(false);
      } else {
        toast({
          title: "Warning",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/");
  };

  const handlePayClick = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setPaymentDialogOpen(true);
  };

  const handlePaymentComplete = () => {
    checkProfileAndFetchOrders(); // Refresh orders after payment
    setPaymentDialogOpen(false);
    setSelectedOrder(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/25">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Delivered
          </Badge>
        );
      case "on_transit":
        return (
          <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 shadow-lg shadow-cyan-500/25">
            <Truck className="h-3 w-3 mr-1" />
            In Transit
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg shadow-amber-500/25">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-red-500/25">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/25">
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg shadow-amber-500/25">
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-red-500/25">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const getOrderItemNames = (order: Order): string => {
    if (!order.order_items || order.order_items.length === 0) {
      return "";
    }
    
    const productNames = order.order_items
      .map((item) => item.product?.name)
      .filter((name): name is string => Boolean(name));
    
    if (productNames.length === 0) {
      return "";
    }
    
    if (productNames.length === 1) {
      return productNames[0];
    }
    
    if (productNames.length === 2) {
      return productNames.join(" & ");
    }
    
    // For 3+ items, show first item and count
    return `${productNames[0]} & ${productNames.length - 1} more`;
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const inTransitOrders = orders.filter((o) => o.status === "on_transit").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-cyan-600 border-t-transparent mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  
  // Redirect if not authenticated (after loading is complete)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cyan-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Professional Header */}
      <header className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-b-2 border-purple-200/50 dark:border-purple-800/50 sticky top-0 z-50 shadow-xl shadow-purple-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg shadow-lg shadow-cyan-500/25">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-400 dark:hover:border-purple-600 hover:text-purple-700 dark:hover:text-purple-300"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        {/* Animated gradient background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-60 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-60 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Welcome back
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
              Manage your orders and track deliveries
            </p>
          </div>

          {/* Stats Cards - Mobile Optimized with Neon Design */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 border-2 border-blue-300 dark:border-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
              <CardHeader className="pb-2 px-4 pt-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-400">
                    Total Orders
                  </CardTitle>
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-200">
                  {totalOrders}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-2 border-amber-300 dark:border-amber-700 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all">
              <CardHeader className="pb-2 px-4 pt-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-400">
                    Pending
                  </CardTitle>
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl sm:text-2xl font-bold text-amber-900 dark:text-amber-200">
                  {pendingOrders}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 border-2 border-cyan-300 dark:border-cyan-700 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all">
              <CardHeader className="pb-2 px-4 pt-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium text-cyan-700 dark:text-cyan-400">
                    In Transit
                  </CardTitle>
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl sm:text-2xl font-bold text-cyan-900 dark:text-cyan-200">
                  {inTransitOrders}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 border-2 border-emerald-300 dark:border-emerald-700 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all">
              <CardHeader className="pb-2 px-4 pt-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Delivered
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-200">
                  {deliveredOrders}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300 dark:border-purple-700 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all col-span-2 sm:col-span-1">
              <CardHeader className="pb-2 px-4 pt-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-400">
                    Total Spent
                  </CardTitle>
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-200">
                  ${totalSpent.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Section */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-2 border-purple-200/50 dark:border-purple-800/50 shadow-xl shadow-purple-500/10">
            <CardHeader className="border-b-2 border-purple-200/50 dark:border-purple-800/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Your Orders
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    View and track all your orders
                  </CardDescription>
                </div>
                <Button
                  onClick={() => navigate("/products")}
                  className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
                  size="sm"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Shop Now
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-cyan-600 border-t-transparent mb-4"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 mb-4 sm:mb-6 border-2 border-cyan-300 dark:border-cyan-700">
                    <Package className="h-8 w-8 sm:h-10 sm:w-10 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    No orders yet
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto px-4">
                    Start shopping to see your orders here. Browse our products and add items to your cart.
                  </p>
                  <Button
                    size="lg"
                    onClick={() => navigate("/products")}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {orders.map((order) => (
                    <Card
                      key={order.id}
                      className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-2 border-purple-200/50 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all cursor-pointer"
                      onClick={() => navigate(`/customer/orders/${order.id}`)}
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col gap-4">
                          {/* Order Header - Mobile Optimized */}
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col gap-2 mb-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                    {order.order_number}
                                  </h3>
                                  <div className="flex flex-wrap gap-2">
                                    {getStatusBadge(order.status)}
                                    {getPaymentBadge(order.payment_status)}
                                  </div>
                                </div>
                                {getOrderItemNames(order) && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    {getOrderItemNames(order)}
                                  </p>
                                )}
                              </div>
                              
                              {/* Order Details - Stack on Mobile */}
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                  <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    ${order.total_amount.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                                  <span>
                                    {new Date(order.created_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                                {order.payment_method && (
                                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                    <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                                    <span className="truncate">{order.payment_method}</span>
                                  </div>
                                )}
                                {order.order_items && order.order_items.length > 0 && (
                                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                    <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                                    <span>{order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                              {order.status === "pending" && (
                                <Button
                                  size="sm"
                                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                                  onClick={(e) => handlePayClick(e, order)}
                                >
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Pay Now
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-400 dark:hover:border-purple-600 hover:text-purple-700 dark:hover:text-purple-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/customer/orders/${order.id}`);
                                }}
                              >
                                <span className="hidden sm:inline">View Details</span>
                                <span className="sm:hidden">Details</span>
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        order={selectedOrder}
        onOrderComplete={handlePaymentComplete}
      />

      {/* Profile Completion Dialog */}
      <Dialog 
        open={profileDialogOpen} 
        onOpenChange={(open) => {
          // Only allow closing if profile is complete
          if (!open && isProfileComplete) {
            setProfileDialogOpen(false);
          }
        }}
      >
        <DialogContent 
          className={`sm:max-w-md max-h-[95vh] flex flex-col overflow-hidden p-0 ${!isProfileComplete ? '[&>button]:hidden' : ''}`}
          onInteractOutside={(e) => {
            // Prevent closing by clicking outside if profile is incomplete
            if (!isProfileComplete) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            // Prevent closing with Escape key if profile is incomplete
            if (!isProfileComplete) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Please provide the following information to complete your profile and continue using our services.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProfileSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="space-y-4 overflow-y-auto flex-1 px-6 pb-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  required
                  disabled={profileLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="123 Main Street"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  required
                  disabled={profileLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="New York"
                  value={profileData.city}
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  required
                  disabled={profileLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province *</Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="NY"
                  value={profileData.state}
                  onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                  required
                  disabled={profileLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">Zip/Postal Code *</Label>
                <Input
                  id="zip_code"
                  type="text"
                  placeholder="10001"
                  value={profileData.zip_code}
                  onChange={(e) => setProfileData({ ...profileData, zip_code: e.target.value })}
                  required
                  disabled={profileLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="United States"
                  value={profileData.country}
                  onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                  required
                  disabled={profileLoading}
                />
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-6 pt-4 border-t flex-shrink-0">
              <Button
                type="submit"
                className="flex-1"
                disabled={profileLoading}
              >
                {profileLoading ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
