import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ArrowLeft,
  Edit,
  CreditCard,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Truck,
  CheckCircle2,
  X,
  AlertCircle,
  Search,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { ordersApi, Order } from "@/apiRoutes";

export default function AdminOrders() {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchOrders();
  }, [isAuthenticated, navigate, currentPage, searchQuery, dateFrom, dateTo]);

  const fetchOrders = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const params: {
        page?: number;
        per_page?: number;
        search?: string;
        date_from?: string;
        date_to?: string;
      } = {
        page: currentPage,
        per_page: itemsPerPage,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      
      const data = await ordersApi.getAllOrders(params);
      setOrders(data.orders);
      setTotalOrders(data.total);
      setTotalPages(data.pages);
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

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search
    fetchOrders();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
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
    
    return `${productNames[0]} & ${productNames.length - 1} more`;
  };


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
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/admin")}
                  className="text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-800/50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Orders Management
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">
                    Manage all orders in your store
                  </p>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-2 border-purple-200/50 dark:border-purple-800/50 shadow-xl shadow-purple-500/10">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    All Orders ({totalOrders})
                  </h2>
                </div>

                {/* Search and Filter Section */}
                <div className="mb-6 space-y-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-800/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Product Name Search */}
                    <div className="space-y-2">
                      <Label htmlFor="search" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Search by Product Name
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                          placeholder="Search products..."
                          className="pl-10 border-2 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                        />
                      </div>
                    </div>

                    {/* Date From */}
                    <div className="space-y-2">
                      <Label htmlFor="date_from" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Date From
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="date_from"
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="pl-10 border-2 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                        />
                      </div>
                    </div>

                    {/* Date To */}
                    <div className="space-y-2">
                      <Label htmlFor="date_to" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Date To
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="date_to"
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="pl-10 border-2 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSearch}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/25"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                    {(searchQuery || dateFrom || dateTo) && (
                      <Button
                        variant="outline"
                        onClick={handleClearFilters}
                        className="border-gray-300 dark:border-gray-700"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-purple-200 border-t-purple-600"></div>
                    <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t("processing")}</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
                      <Clock className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">No orders found</p>
                  </div>
                ) : (
                  <>
                    <div className="border-2 border-purple-200/50 dark:border-purple-800/50 rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-b-2 border-purple-200 dark:border-purple-800">
                            <TableHead className="font-bold text-gray-900 dark:text-white">Order Number</TableHead>
                            <TableHead className="font-bold text-gray-900 dark:text-white">Products</TableHead>
                            <TableHead className="font-bold text-gray-900 dark:text-white">Status</TableHead>
                            <TableHead className="font-bold text-gray-900 dark:text-white">Payment</TableHead>
                            <TableHead className="font-bold text-gray-900 dark:text-white">Amount</TableHead>
                            <TableHead className="font-bold text-gray-900 dark:text-white">Date</TableHead>
                            <TableHead className="font-bold text-gray-900 dark:text-white">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow
                              key={order.id}
                              className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-colors"
                            >
                              <TableCell className="font-mono font-semibold text-gray-900 dark:text-white">
                                {order.order_number}
                              </TableCell>
                              <TableCell className="text-gray-800 dark:text-gray-200">
                                {getOrderItemNames(order) || "N/A"}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(order.status)}
                              </TableCell>
                              <TableCell>
                                {getPaymentBadge(order.payment_status)}
                              </TableCell>
                              <TableCell className="font-semibold text-gray-900 dark:text-white">
                                ${order.total_amount.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-gray-600 dark:text-gray-400">
                                {new Date(order.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                                    className="border-cyan-300 dark:border-cyan-700 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:border-cyan-400 dark:hover:border-cyan-600 hover:text-cyan-700 dark:hover:text-cyan-300"
                                  >
                                    {t("viewDetails")}
                                  </Button>
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
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t-2 border-purple-200/50 dark:border-purple-800/50 mt-6">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Showing <span className="font-bold text-purple-600 dark:text-purple-400">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                          <span className="font-bold text-purple-600 dark:text-purple-400">{Math.min(currentPage * itemsPerPage, totalOrders)}</span> of{" "}
                          <span className="font-bold text-purple-600 dark:text-purple-400">{totalOrders}</span> orders
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:opacity-50"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                            Page {currentPage} of {totalPages}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage >= totalPages}
                            className="border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:opacity-50"
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
            </Card>
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
              <Label htmlFor="order-status" className="font-semibold text-gray-700 dark:text-gray-300">{t("status")}</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger 
                  id="order-status"
                  className="border-2 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
                >
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
    </div>
  );
}

