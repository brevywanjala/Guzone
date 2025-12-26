import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Truck,
  Edit,
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ordersApi, Order, usersApi, customersApi, User } from "@/apiRoutes";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminDashboard = () => {
  const { t } = useLanguage();
  const { isAuthenticated, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [usersDialogOpen, setUsersDialogOpen] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    fetchOrders();
    fetchUsers();
    fetchCustomers();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    if (!token) return;

    try {
      const data = await ordersApi.getAllOrders();
      setOrders(data.orders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!token) return;

    try {
      const usersData = await usersApi.getAllUsers();
      setTotalUsers(usersData.length);
      setUsers(usersData); // Store users for the dialog
    } catch (error: any) {
      console.error("Error fetching users:", error);
      // Don't show toast for this as it's not critical
    }
  };

  const handleUsersCardClick = async () => {
    setCurrentPage(1); // Reset to first page
    setUsersDialogOpen(true);
    if (users.length === 0) {
      setUsersLoading(true);
      try {
        const usersData = await usersApi.getAllUsers();
        setUsers(usersData);
      } catch (error: any) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to load users",
          variant: "destructive",
        });
      } finally {
        setUsersLoading(false);
      }
    }
  };

  const fetchCustomers = async () => {
    if (!token) return;

    try {
      const customers = await customersApi.getAllCustomers();
      setTotalCustomers(customers.length);
    } catch (error: any) {
      console.error("Error fetching customers:", error);
      // Don't show toast for this as it's not critical
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: { color: string; icon: any; label: string; border: string } } = {
      pending: { 
        color: "bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-400", 
        border: "border-amber-300 dark:border-amber-700",
        icon: Clock, 
        label: t("pending") 
      },
      on_transit: { 
        color: "bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 text-cyan-700 dark:text-cyan-400", 
        border: "border-cyan-300 dark:border-cyan-700",
        icon: Truck, 
        label: t("onTransit") 
      },
      delivered: { 
        color: "bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400", 
        border: "border-emerald-300 dark:border-emerald-700",
        icon: CheckCircle2, 
        label: t("delivered") 
      },
      cancelled: { 
        color: "bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-700 dark:text-red-400", 
        border: "border-red-300 dark:border-red-700",
        icon: X, 
        label: t("cancelled") 
      },
    };
    const variant = variants[status] || { 
      color: "bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-900/30 dark:to-slate-900/30 text-gray-700 dark:text-gray-400", 
      border: "border-gray-300 dark:border-gray-700",
      icon: AlertCircle, 
      label: status 
    };
    const Icon = variant.icon;
    
    return (
      <Badge className={`${variant.color} ${variant.border} border font-semibold shadow-sm`}>
        <Icon className="h-3 w-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const variants: { [key: string]: { color: string; label: string; border: string } } = {
      pending: { 
        color: "bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-400", 
        border: "border-amber-300 dark:border-amber-700",
        label: t("pending") 
      },
      paid: { 
        color: "bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400", 
        border: "border-emerald-300 dark:border-emerald-700",
        label: t("paid") 
      },
      failed: { 
        color: "bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-700 dark:text-red-400", 
        border: "border-red-300 dark:border-red-700",
        label: t("failed") 
      },
      refunded: { 
        color: "bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-700 dark:text-orange-400", 
        border: "border-orange-300 dark:border-orange-700",
        label: "Refunded" 
      },
    };
    const variant = variants[status] || { 
      color: "bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-900/30 dark:to-slate-900/30 text-gray-700 dark:text-gray-400", 
      border: "border-gray-300 dark:border-gray-700",
      label: status 
    };
    
    return (
      <Badge className={`${variant.color} ${variant.border} border font-semibold shadow-sm`}>
        {variant.label}
      </Badge>
    );
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

  const handleUpdatePayment = (order: Order) => {
    setSelectedOrder(order);
    setPaymentMessage(order.payment_confirmation_message || "");
    setPaymentDialogOpen(true);
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setSelectedStatus(order.status);
    setStatusDialogOpen(true);
  };

  const handleSavePayment = async () => {
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      await ordersApi.updatePaymentStatus(selectedOrder.id, {
        payment_status: "paid",
        payment_confirmation_message: paymentMessage,
      });
      
      toast({
        title: "Success",
        description: "Payment status updated successfully",
      });
      
      setPaymentDialogOpen(false);
      setPaymentMessage("");
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update payment status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder || !selectedStatus) return;

    setUpdating(true);
    try {
      await ordersApi.updateOrderStatus(selectedOrder.id, {
        status: selectedStatus,
      });
      
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      
      setStatusDialogOpen(false);
      setSelectedStatus("");
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const recentOrders = orders.slice(0, 10);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const totalRevenue = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + o.total_amount, 0);

  const stats = [
    {
      title: t("totalUsers"),
      value: totalUsers.toString(),
      change: "+0%",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Products",
      value: "0", // TODO: Fetch real product count
      change: "+0%",
      icon: Package,
      color: "text-green-500",
    },
    {
      title: t("orders30d"),
      value: totalOrders.toString(),
      change: "+0%",
      icon: ShoppingCart,
      color: "text-purple-500",
      isClickable: true,
    },
    {
      title: t("revenue30d"),
      value: `$${totalRevenue.toFixed(2)}`,
      change: "+0%",
      icon: CreditCard,
      color: "text-amber-500",
    },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cyan-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      <main className="flex-1 relative">
        {/* Animated gradient background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-60 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-60 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container py-8 relative z-10">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Admin {t("dashboard")}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  {t("platformOverview")}
                </p>
              </div>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all">
                {t("exportData")}
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const isUsersCard = index === 0; // First card is users
                const isProductsCard = index === 1; // Second card is products
                const isOrdersCard = index === 2; // Third card is orders
                
                // Neon color schemes for each card
                const cardStyles = [
                  { gradient: 'from-cyan-500/10 to-blue-500/10', border: 'border-cyan-300/50', iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-500', shadow: 'shadow-cyan-500/20' },
                  { gradient: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-300/50', iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
                  { gradient: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-300/50', iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500', shadow: 'shadow-purple-500/20' },
                  { gradient: 'from-amber-500/10 to-orange-500/10', border: 'border-amber-300/50', iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
                ];
                const style = cardStyles[index];
                
                return (
                  <Card 
                    key={index} 
                    className={`p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-2 ${style.border} ${style.shadow} shadow-xl hover:shadow-2xl transition-all duration-300 ${
                      (isUsersCard || isProductsCard || isOrdersCard) ? 'cursor-pointer hover:scale-105' : ''
                    } ${isUsersCard ? 'hover:border-cyan-400' : ''} ${isProductsCard ? 'hover:border-emerald-400' : ''} ${isOrdersCard ? 'hover:border-purple-400' : ''}`}
                    onClick={
                      isUsersCard ? handleUsersCardClick : 
                      isProductsCard ? () => navigate("/admin/products") : 
                      isOrdersCard ? () => navigate("/admin/orders") : 
                      undefined
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{stat.change}</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-xl ${style.iconBg} shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-2 border-purple-200/50 dark:border-purple-800/50 shadow-xl shadow-purple-500/10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t("recentOrders")}</h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate("/admin/orders")}
                      className="border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-400 dark:hover:border-purple-600 hover:text-purple-700 dark:hover:text-purple-300"
                    >
                      {t("viewAll")}
                    </Button>
                  </div>

                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-purple-200 border-t-purple-600"></div>
                      <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t("processing")}</p>
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex p-4 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
                        <ShoppingCart className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">No orders found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white to-purple-50/50 dark:from-slate-700/50 dark:to-purple-900/20 border border-purple-200/50 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-sm font-medium">
                                  {order.order_number}
                                </span>
                                {getStatusBadge(order.status)}
                                {getPaymentBadge(order.payment_status)}
                              </div>
                              {getOrderItemNames(order) && (
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                  {getOrderItemNames(order)}
                                </p>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t("amount")}: <span className="text-purple-600 dark:text-purple-400 font-bold">${order.total_amount.toFixed(2)}</span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/orders/${order.id}`)}
                              className="w-full border-cyan-300 dark:border-cyan-700 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:border-cyan-400 dark:hover:border-cyan-600 hover:text-cyan-700 dark:hover:text-cyan-300"
                            >
                              {t("viewDetails")}
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                            <div className="flex gap-2">
                              {order.payment_status !== "paid" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdatePayment(order)}
                                  className="border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-300"
                                >
                                  <CreditCard className="h-4 w-4 mr-1" />
                                  {t("updatePayment")}
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateStatus(order)}
                                className="border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-400 dark:hover:border-purple-600 hover:text-purple-700 dark:hover:text-purple-300"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                {t("updateStatus")}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">{t("systemAlerts")}</h2>
                  
                  <div className="space-y-3">
                    <div className="flex gap-3 p-3 rounded-lg bg-yellow-500/10">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {pendingOrders} {t("orders")} {t("pending")}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 p-3 rounded-lg bg-green-500/10">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {deliveredOrders} {t("orders")} {t("delivered")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Update Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-2xl shadow-emerald-500/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {t("paymentConfirmation")}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {t("enterPaymentInfo")} - {selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-message" className="font-semibold text-gray-700 dark:text-gray-300">
                {t("paymentMessage")}
              </Label>
              <Textarea
                id="payment-message"
                value={paymentMessage}
                onChange={(e) => setPaymentMessage(e.target.value)}
                placeholder="Enter payment confirmation details (e.g., M-Pesa transaction code, bank reference, etc.)"
                rows={4}
                className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setPaymentDialogOpen(false)}
                className="border-gray-300 dark:border-gray-700"
              >
                {t("cancel")}
              </Button>
              <Button 
                onClick={handleSavePayment} 
                disabled={updating}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/25"
              >
                {updating ? t("processing") : t("save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-purple-200/50 dark:border-purple-800/50 shadow-2xl shadow-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t("updateStatus")}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {t("orderNumber")}: {selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="order-status">{t("status")}</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="order-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{t("pending")}</SelectItem>
                  <SelectItem value="on_transit">{t("onTransit")}</SelectItem>
                  <SelectItem value="delivered">{t("delivered")}</SelectItem>
                  <SelectItem value="cancelled">{t("cancelled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStatusDialogOpen(false)}
                className="border-gray-300 dark:border-gray-700"
              >
                {t("cancel")}
              </Button>
              <Button 
                onClick={handleSaveStatus} 
                disabled={updating || !selectedStatus}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/25"
              >
                {updating ? t("processing") : t("save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Users List Dialog */}
      <Dialog open={usersDialogOpen} onOpenChange={setUsersDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-cyan-200/50 dark:border-cyan-800/50 shadow-2xl shadow-cyan-500/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              All Users ({users.length})
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              View and manage all users in the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {usersLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-cyan-200 border-t-cyan-600"></div>
                <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex p-4 rounded-full bg-cyan-100 dark:bg-cyan-900/30 mb-4">
                  <Users className="h-12 w-12 text-cyan-600 dark:text-cyan-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">No users found</p>
              </div>
            ) : (
              <>
                <div className="border-2 border-cyan-200/50 dark:border-cyan-800/50 rounded-xl overflow-hidden shadow-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 border-b-2 border-cyan-200 dark:border-cyan-800">
                        <TableHead className="font-bold text-gray-900 dark:text-white">ID</TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white">Username</TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white">Email</TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white">Role</TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white">Status</TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white">Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((user) => (
                          <TableRow 
                            key={user.id}
                            className="hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-blue-50/50 dark:hover:from-cyan-900/20 dark:hover:to-blue-900/20 transition-colors"
                          >
                            <TableCell className="font-mono font-semibold text-gray-700 dark:text-gray-300">
                              {user.id}
                            </TableCell>
                            <TableCell className="font-semibold text-gray-900 dark:text-white">
                              {user.username}
                            </TableCell>
                            <TableCell className="text-gray-700 dark:text-gray-300">
                              {user.email}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={`${
                                  user.role === 'admin' 
                                    ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700' 
                                    : 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700'
                                } border font-semibold shadow-sm`}
                              >
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${
                                  user.is_active 
                                    ? 'bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700' 
                                    : 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700'
                                } border font-semibold shadow-sm`}
                              >
                                {user.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination Controls */}
                {users.length > itemsPerPage && (
                  <div className="flex items-center justify-between pt-4 border-t-2 border-cyan-200/50 dark:border-cyan-800/50">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Showing <span className="font-bold text-cyan-600 dark:text-cyan-400">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">{Math.min(currentPage * itemsPerPage, users.length)}</span> of{" "}
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">{users.length}</span> users
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="border-cyan-300 dark:border-cyan-700 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg border border-cyan-200 dark:border-cyan-800">
                        Page {currentPage} of {Math.ceil(users.length / itemsPerPage)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(Math.ceil(users.length / itemsPerPage), prev + 1)
                          )
                        }
                        disabled={currentPage >= Math.ceil(users.length / itemsPerPage)}
                        className="border-cyan-300 dark:border-cyan-700 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 disabled:opacity-50"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
