import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard } from "./ProductCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product } from "@/data/mockData";

interface FeaturedCarouselProps {
  products: Product[];
}

export function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  const { t } = useLanguage();
  
  // Filter for featured products from the passed products
  const featuredProducts = products.filter((p) => p.featured);

  if (featuredProducts.length === 0) {
    return null; // Don't show section if no featured products
  }

  return (
    <section className="py-8">
      <div className="container">
        <h2 className="text-3xl font-bold mb-6">{t("featuredProducts")}</h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {featuredProducts.map((product) => (
              <CarouselItem
                key={product.id}
                className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
}
