import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { CategoryBar } from "@/components/CategoryBar";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { DiscountCarousel } from "@/components/DiscountCarousel";
import { ProductCard } from "@/components/ProductCard";
import { HeroTextCarousel } from "@/components/HeroTextCarousel";
import { useLanguage } from "@/contexts/LanguageContext";
import { productsApi } from "@/apiRoutes/productsApi";
import { categoriesApi } from "@/apiRoutes/categoriesApi";
import { transformProduct } from "@/utils/productTransform";
import { Product } from "@/data/mockData";
import heroTradeImage from "@/assets/hero-trade.jpg";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categoryMap, setCategoryMap] = useState<Map<string, number>>(new Map());
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // All products for carousels
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  // Fetch categories and create name-to-ID map
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await categoriesApi.getCategories();
        const map = new Map<string, number>();
        // Only include active categories in the map
        categories.filter(cat => cat.is_active).forEach(cat => {
          map.set(cat.name, cat.id);
        });
        setCategoryMap(map);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch all products for carousels (featured, discounted)
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await productsApi.getProducts({ per_page: 100 });
        const transformedProducts = response.products.map(transformProduct);
        setAllProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching all products:", error);
      }
    };

    fetchAllProducts();
  }, []);

  // Fetch products based on search and category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: {
          search?: string;
          category_id?: number;
          per_page?: number;
        } = {
          per_page: 100, // Max per page
        };
        
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery.length > 0) {
          params.search = trimmedQuery;
        }
        
        if (selectedCategoryId) {
          params.category_id = selectedCategoryId;
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
  }, [searchQuery, selectedCategoryId]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative bg-gradient-to-br from-background via-background to-primary/5 py-16 md:py-24 overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 -z-10">
            <img
              src={heroTradeImage}
              alt="Trade background"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/85" />
          </div>
          
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="mb-12">
                <HeroTextCarousel />
              </div>
              <div className="max-w-2xl mx-auto">
                <SearchBar onSearch={setSearchQuery} />
              </div>
            </div>
          </div>
        </section>

        <CategoryBar
          selectedCategory={selectedCategory}
          onSelectCategory={(categoryName) => {
            setSelectedCategory(categoryName);
            setSelectedCategoryId(categoryName ? categoryMap.get(categoryName) || null : null);
          }}
        />

        {/* Show search results immediately after categories if there's a search query or category selected */}
        {(searchQuery.trim().length > 0 || selectedCategory) ? (
          <section className="py-8">
            <div className="container">
              <h2 className="text-3xl font-bold mb-6">
                {selectedCategory || t("products")}
              </h2>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mb-4"></div>
                  <p className="text-sm text-muted-foreground">{t("loading") || "Loading products..."}</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchQuery || selectedCategory
                      ? t("noProductsFound") || "No products found matching your criteria."
                      : t("noProducts") || "No products available at the moment."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            <FeaturedCarousel products={allProducts} />
            <DiscountCarousel products={allProducts} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
