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

interface DiscountCarouselProps {
  products: Product[];
}

export function DiscountCarousel({ products }: DiscountCarouselProps) {
  const { t } = useLanguage();
  
  // Filter for products with discounts from the passed products
  const discountedProducts = products.filter((p) => p.discount && p.discount > 0);

  if (discountedProducts.length === 0) {
    return null; // Don't show section if no discounted products
  }

  return (
    <section className="py-8 bg-muted/30">
      <div className="container">
        <h2 className="text-3xl font-bold mb-6 text-destructive">
          {t("dealsOfTheDay")}
        </h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {discountedProducts.map((product) => (
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
