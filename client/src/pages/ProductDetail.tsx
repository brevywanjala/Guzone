import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/ProductCard";
import { productsApi } from "@/apiRoutes/productsApi";
import { Product as BackendProduct } from "@/apiRoutes/productsApi";
import { transformProduct } from "@/utils/productTransform";
import { Product as FrontendProduct } from "@/data/mockData";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShoppingCart, Verified, ArrowLeft, Store, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getImageUrl } from "@/utils/productTransform";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<FrontendProduct | null>(null);
  const [similarProducts, setSimilarProducts] = useState<FrontendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("Product ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const productId = parseInt(id);
        
        // Fetch product details
        const backendProduct = await productsApi.getProduct(productId);
        const transformedProduct = transformProduct(backendProduct);
        setProduct(transformedProduct);

        // Fetch similar products
        try {
          const similarBackendProducts = await productsApi.getSimilarProducts(productId, 4);
          const transformedSimilar = similarBackendProducts.map(transformProduct);
          setSimilarProducts(transformedSimilar);
        } catch (similarError) {
          console.error("Error fetching similar products:", similarError);
          // Don't fail the whole page if similar products fail
          setSimilarProducts([]);
        }
      } catch (err: any) {
        console.error("Error fetching product:", err);
        setError(err.response?.data?.error || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <p className="text-center text-muted-foreground">{error || t("productNotFound")}</p>
          <Button onClick={() => navigate("/")} className="mx-auto mt-4 block">
            {t("backToHome")}
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  // Get all image URLs, ensuring we have at least one
  const allImages = product.images && product.images.length > 0 
    ? product.images.map(getImageUrl)
    : product.image 
    ? [getImageUrl(product.image)]
    : ['/placeholder-product.jpg'];
  
  const images = allImages;

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: t("addedToCart"),
      description: `${product.name} ${t("addedToCartDesc")}`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/products")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToProducts")}
          </Button>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={images[selectedImage] || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.discount && (
                  <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                    -{Math.round(product.discount)}%
                  </Badge>
                )}
                {product.featured && (
                  <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
                    {t("featured")}
                  </Badge>
                )}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === idx
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start gap-2 mb-2">
                  <h1 className="text-3xl font-bold flex-1">{product.name}</h1>
                  {product.verified && (
                    <Verified className="h-6 w-6 text-primary flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Store className="h-4 w-4" />
                    <span>{product.supplier}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{product.country}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-primary">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("minOrder")}: {product.minOrder} {product.unit}
                </p>
                <Badge
                  variant={product.inStock ? "default" : "destructive"}
                  className="w-fit"
                >
                  {product.inStock ? t("inStock") : t("outOfStock")}
                </Badge>
              </div>

              {product.description && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">{t("description")}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full"
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {t("addToCart")}
              </Button>
            </div>
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">{t("similarProducts")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
