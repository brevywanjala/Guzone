import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { categoriesApi, Category } from "@/apiRoutes/categoriesApi";

interface CategoryBarProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryBar({
  selectedCategory,
  onSelectCategory,
}: CategoryBarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getCategories();
        // Only show active categories
        const activeCategories = data.filter(cat => cat.is_active);
        setCategories(activeCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 p-4">
          <div className="animate-pulse bg-muted h-9 w-20 rounded-md"></div>
          <div className="animate-pulse bg-muted h-9 w-24 rounded-md"></div>
          <div className="animate-pulse bg-muted h-9 w-28 rounded-md"></div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 p-4">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => onSelectCategory(null)}
          size="sm"
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.name ? "default" : "outline"}
            onClick={() => onSelectCategory(cat.name)}
            size="sm"
          >
            {cat.name}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
