import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { ProductCard } from "@/components/ProductCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { productsApi } from "@/apiRoutes/productsApi";
import { transformProduct } from "@/utils/productTransform";
import { Product } from "@/data/mockData";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  // Fetch products based on search
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: {
          search?: string;
          per_page?: number;
        } = {
          per_page: 100, // Max per page
        };
        
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery.length > 0) {
          params.search = trimmedQuery;
        }
        
        const response = await productsApi.getProducts(params);
        // Transform products to frontend format
        const transformedProducts = response.products.map(transformProduct);
        setProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t("products")}</h1>
              <p className="text-muted-foreground">
                {t("browseProducts") || "Browse our wholesale product catalog"}
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 max-w-2xl">
                <SearchBar onSearch={setSearchQuery} />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mb-4"></div>
                <p className="text-sm text-muted-foreground">{t("loading") || "Loading products..."}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? t("noProductsFound") || "No products found matching your criteria."
                    : t("noProducts") || "No products available at the moment."}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
