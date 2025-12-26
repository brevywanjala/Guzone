import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Package,
  DollarSign,
  Calendar,
  CreditCard,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ordersApi, Order, OrderItem, Product } from "@/apiRoutes";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<{ [key: number]: number }>({});
  const isAdmin = user?.role === 'admin';
  
  // Check if we came from admin dashboard based on the URL path
  const isFromAdmin = window.location.pathname.startsWith('/admin/orders');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    if (id) {
      fetchOrder();
    }
  }, [id, isAuthenticated, navigate]);

  const fetchOrder = async () => {
    if (!id) return;

    try {
      const orderData = await ordersApi.getOrder(parseInt(id));
      setOrder(orderData);
      // Initialize selected image index for each product
      const initialImageIndex: { [key: number]: number } = {};
      orderData.order_items.forEach((item) => {
        if (item.product) {
          initialImageIndex[item.product.id] = 0;
        }
      });
      setSelectedImageIndex(initialImageIndex);
    } catch (error: any) {
      console.error("Error fetching order:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load order details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-0">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Delivered
          </Badge>
        );
      case "on_transit":
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-0">
            <Truck className="h-3 w-3 mr-1" />
            In Transit
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" className="border-0">
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
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-0">
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0">
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="border-0">
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

  const getProductImages = (product: Product | undefined): string[] => {
    if (!product) return [];
    const imageUrls: string[] = [];
    if (product.images && product.images.length > 0) {
      imageUrls.push(...product.images.map((img) => img.image_url));
    }
    if (product.main_image_url && !imageUrls.includes(product.main_image_url)) {
      imageUrls.unshift(product.main_image_url);
    }
    return imageUrls.length > 0 ? imageUrls : ["/placeholder-product.jpg"];
  };

  const handleImageSelect = (productId: number, imageIndex: number) => {
    setSelectedImageIndex((prev) => ({
      ...prev,
      [productId]: imageIndex,
    }));
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Order not found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The order you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button onClick={() => navigate(isAdmin ? "/admin" : "/customer/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(isFromAdmin ? "/admin" : "/customer/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Order Header */}
        <Card className="border border-gray-200 dark:border-slate-700 shadow-sm mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Order {order.order_number}
                </CardTitle>
                <CardDescription className="mt-2">
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {getStatusBadge(order.status)}
                    {getPaymentBadge(order.payment_status)}
                  </div>
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${order.total_amount.toFixed(2)}
                  </p>
                </div>
              </div>
              {order.payment_method && (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {order.payment_method}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Shipping Address</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {order.shipping_address}
                  </p>
                </div>
              </div>
            </div>
            {/* Payment Confirmation Message (Admin Only) */}
            {isAdmin && order.payment_confirmation_message && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        Payment Confirmation Message
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {order.payment_confirmation_message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Ordered Products ({order.order_items.length})
          </h2>

          {order.order_items.map((item: OrderItem) => {
            const product = item.product as Product | undefined;
            const images = getProductImages(product);
            const currentImageIndex = selectedImageIndex[product?.id || 0] || 0;
            const currentImage = images[currentImageIndex] || "/placeholder-product.jpg";

            return (
              <Card
                key={item.id}
                className="border border-gray-200 dark:border-slate-700 shadow-sm"
              >
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Product Images */}
                    <div className="lg:col-span-1">
                      <div className="space-y-4">
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                          {images.length > 0 ? (
                            <img
                              src={currentImage}
                              alt={product?.name || "Product image"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        {images.length > 1 && (
                          <div className="grid grid-cols-4 gap-2">
                            {images.map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleImageSelect(product?.id || 0, idx)}
                                className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                                  currentImageIndex === idx
                                    ? "border-blue-600 dark:border-blue-400"
                                    : "border-gray-200 dark:border-slate-700"
                                }`}
                              >
                                <img
                                  src={img}
                                  alt={`${product?.name || "Product"} ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {product?.name || "Product"}
                        </h3>
                        {product?.sku && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            SKU: <span className="font-mono">{product.sku}</span>
                          </p>
                        )}
                        {product?.category && (
                          <Badge variant="outline" className="mb-2">
                            {product.category.name}
                          </Badge>
                        )}
                      </div>

                      {product?.description && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Description
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {product.description}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Unit Price</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            ${item.unit_price.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Quantity</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {item.quantity}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Subtotal</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            ${item.subtotal.toFixed(2)}
                          </p>
                        </div>
                        {product?.stock_quantity !== undefined && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Stock</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {product.stock_quantity}
                            </p>
                          </div>
                        )}
                      </div>

                      {product && (
                        <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                          <div className="flex flex-wrap gap-2 text-sm">
                            {product.is_active ? (
                              <Badge className="bg-green-600 hover:bg-green-700 text-white border-0">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Inactive</Badge>
                            )}
                            {product.main_image_url && (
                              <Badge variant="outline">Has Main Image</Badge>
                            )}
                            {product.images && product.images.length > 0 && (
                              <Badge variant="outline">
                                {product.images.length} Image{product.images.length !== 1 ? "s" : ""}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

