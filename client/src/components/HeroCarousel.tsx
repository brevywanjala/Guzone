import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";

const slides = [
  { id: 1, image: heroSlide1, alt: "Modern warehouse" },
  { id: 2, image: heroSlide2, alt: "Suppliers facility" },
  { id: 3, image: heroSlide3, alt: "Logistics and shipping" },
];

export function HeroCarousel() {
  const [plugin] = useState(() =>
    Autoplay({ delay: 5000, stopOnInteraction: false })
  );

  return (
    <div className="absolute inset-0 -z-10">
      <Carousel
        plugins={[plugin]}
        opts={{
          loop: true,
        }}
        className="w-full h-full"
      >
        <CarouselContent className="h-full ml-0">
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className="pl-0 h-full">
              <div className="relative h-full w-full">
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
