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

      {/* WhatsApp Contact Button - Fixed at bottom right */}
      <div className="fixed bottom-6 right-6 z-40">
        <a
          href="https://wa.me/254710168286"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span className="text-sm font-semibold hidden sm:block group-hover:scale-105 transition-transform">
            Contact Us
          </span>
        </a>
      </div>
    </div>
  );
};

export default Index;
