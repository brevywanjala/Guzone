export interface Supplier {
  id: string;
  name: string;
  country: "Kenya" | "Tanzania";
  city: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  categories: string[];
  logo: string;
  responseTime: string;
  minOrder: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  supplier: string;
  supplierId: string;
  country: "Kenya" | "Tanzania";
  price: number;
  currency: "KES" | "TZS" | "USD";
  minOrder: number;
  unit: string;
  image: string;
  images?: string[];
  description?: string;
  verified: boolean;
  inStock: boolean;
  discount?: number;
  featured?: boolean;
  originalPrice?: number;
}

export const mockSuppliers: Supplier[] = [
  {
    id: "1",
    name: "Nairobi Electronics Ltd",
    country: "Kenya",
    city: "Nairobi",
    verified: true,
    rating: 4.8,
    reviewCount: 156,
    description: "Leading supplier of electronics and consumer goods in East Africa",
    categories: ["Electronics", "Consumer Goods"],
    logo: "🏢",
    responseTime: "< 2h",
    minOrder: "$5,000",
  },
  {
    id: "2",
    name: "Tanzania Textile Mills",
    country: "Tanzania",
    city: "Dar es Salaam",
    verified: true,
    rating: 4.6,
    reviewCount: 89,
    description: "Premium textile manufacturer with 20+ years experience",
    categories: ["Textiles", "Fashion"],
    logo: "🧵",
    responseTime: "< 4h",
    minOrder: "$3,000",
  },
  {
    id: "3",
    name: "Mombasa Food Distributors",
    country: "Kenya",
    city: "Mombasa",
    verified: true,
    rating: 4.9,
    reviewCount: 234,
    description: "Wholesale food products and agricultural goods",
    categories: ["Food & Beverage", "Agriculture"],
    logo: "🌾",
    responseTime: "< 1h",
    minOrder: "$2,000",
  },
  {
    id: "4",
    name: "Arusha Building Materials",
    country: "Tanzania",
    city: "Arusha",
    verified: true,
    rating: 4.7,
    reviewCount: 112,
    description: "Construction materials and hardware supplies",
    categories: ["Construction", "Hardware"],
    logo: "🏗️",
    responseTime: "< 3h",
    minOrder: "$10,000",
  },
  {
    id: "5",
    name: "Kisumu Pharmaceuticals",
    country: "Kenya",
    city: "Kisumu",
    verified: true,
    rating: 4.9,
    reviewCount: 178,
    description: "Licensed pharmaceutical distributor and medical supplies",
    categories: ["Healthcare", "Pharmaceuticals"],
    logo: "💊",
    responseTime: "< 2h",
    minOrder: "$8,000",
  },
  {
    id: "6",
    name: "Dodoma Auto Parts Co",
    country: "Tanzania",
    city: "Dodoma",
    verified: false,
    rating: 4.3,
    reviewCount: 45,
    description: "Automotive parts and accessories supplier",
    categories: ["Automotive", "Parts"],
    logo: "🚗",
    responseTime: "< 6h",
    minOrder: "$4,000",
  },
];

import tvImage from "@/assets/products/tv-samsung.jpg";
import fabricImage from "@/assets/products/fabric-cotton.jpg";
import riceImage from "@/assets/products/rice-premium.jpg";
import cementImage from "@/assets/products/cement-bags.jpg";
import medicineImage from "@/assets/products/medicine-pharma.jpg";
import brakePadsImage from "@/assets/products/brake-pads.jpg";
import laptopImage from "@/assets/products/laptop-modern.jpg";
import smartphoneImage from "@/assets/products/smartphone.jpg";

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Samsung 55\" 4K Smart TV",
    category: "Electronics",
    supplier: "Nairobi Electronics Ltd",
    supplierId: "1",
    country: "Kenya",
    price: 450,
    currency: "USD",
    minOrder: 10,
    unit: "units",
    image: tvImage,
    images: [tvImage, tvImage, tvImage, tvImage],
    description: "Experience stunning 4K UHD resolution with this Samsung Smart TV. Features HDR support, built-in Wi-Fi, multiple HDMI ports, and access to popular streaming apps. Perfect for home entertainment or commercial display. Energy efficient with sleek modern design.",
    verified: true,
    inStock: true,
    featured: true,
    discount: 15,
    originalPrice: 529,
  },
  {
    id: "2",
    name: "Cotton Fabric Rolls",
    category: "Textiles",
    supplier: "Tanzania Textile Mills",
    supplierId: "2",
    country: "Tanzania",
    price: 8.5,
    currency: "USD",
    minOrder: 500,
    unit: "meters",
    image: fabricImage,
    images: [fabricImage, fabricImage, fabricImage],
    description: "Premium quality 100% cotton fabric rolls, ideal for garment manufacturing, home textiles, and industrial use. Available in various colors and patterns. Pre-shrunk, colorfast, and easy to work with. Perfect for bulk orders.",
    verified: true,
    inStock: true,
  },
  {
    id: "3",
    name: "Premium Rice 25kg Bags",
    category: "Food & Beverage",
    supplier: "Mombasa Food Distributors",
    supplierId: "3",
    country: "Kenya",
    price: 35,
    currency: "USD",
    minOrder: 100,
    unit: "bags",
    image: riceImage,
    images: [riceImage, riceImage, riceImage],
    description: "High-quality long-grain white rice in 25kg bags. Carefully selected and processed to ensure premium quality. Low in fat, naturally gluten-free, and perfect for wholesale distribution. Meets international food safety standards.",
    verified: true,
    inStock: true,
    featured: true,
  },
  {
    id: "4",
    name: "Cement 50kg Bags",
    category: "Construction",
    supplier: "Arusha Building Materials",
    supplierId: "4",
    country: "Tanzania",
    price: 12,
    currency: "USD",
    minOrder: 500,
    unit: "bags",
    image: cementImage,
    images: [cementImage, cementImage, cementImage],
    description: "High-grade Portland cement in 50kg bags, perfect for construction projects of all sizes. Excellent binding properties, fast setting, and durable finish. Ideal for foundations, walls, and general construction work. Bulk pricing available.",
    verified: true,
    inStock: true,
    discount: 10,
    originalPrice: 13.3,
  },
  {
    id: "5",
    name: "Paracetamol 500mg (1000 tablets)",
    category: "Pharmaceuticals",
    supplier: "Kisumu Pharmaceuticals",
    supplierId: "5",
    country: "Kenya",
    price: 45,
    currency: "USD",
    minOrder: 50,
    unit: "boxes",
    image: medicineImage,
    images: [medicineImage, medicineImage],
    description: "WHO-approved Paracetamol 500mg tablets for pain relief and fever reduction. Each box contains 1000 tablets in blister packs. Manufactured in GMP-certified facilities. Long shelf life and proper documentation provided for import.",
    verified: true,
    inStock: true,
  },
  {
    id: "6",
    name: "Brake Pads Set",
    category: "Automotive",
    supplier: "Dodoma Auto Parts Co",
    supplierId: "6",
    country: "Tanzania",
    price: 25,
    currency: "USD",
    minOrder: 20,
    unit: "sets",
    image: brakePadsImage,
    images: [brakePadsImage, brakePadsImage, brakePadsImage],
    description: "Premium quality brake pads compatible with most vehicle models. Low dust formula, excellent stopping power, and long-lasting performance. Heat resistant and noise-free operation. Complete set includes front and rear pads with hardware.",
    verified: false,
    inStock: true,
    discount: 20,
    originalPrice: 31.25,
  },
  {
    id: "7",
    name: "Modern Business Laptop",
    category: "Electronics",
    supplier: "Nairobi Electronics Ltd",
    supplierId: "1",
    country: "Kenya",
    price: 650,
    currency: "USD",
    minOrder: 5,
    unit: "units",
    image: laptopImage,
    images: [laptopImage, laptopImage, laptopImage, laptopImage],
    description: "Professional-grade laptop perfect for business use. Features Intel Core processor, 8GB RAM, 256GB SSD, Full HD display, and long battery life. Lightweight design with durable build. Includes Windows OS and 1-year warranty.",
    verified: true,
    inStock: true,
    featured: true,
    discount: 12,
    originalPrice: 739,
  },
  {
    id: "8",
    name: "Professional Smartphone Bundle",
    category: "Electronics",
    supplier: "Nairobi Electronics Ltd",
    supplierId: "1",
    country: "Kenya",
    price: 380,
    currency: "USD",
    minOrder: 10,
    unit: "units",
    image: smartphoneImage,
    images: [smartphoneImage, smartphoneImage, smartphoneImage, smartphoneImage],
    description: "Latest generation smartphone with high-resolution camera, fast processor, and large storage capacity. Bundle includes protective case, screen protector, and charger. Dual SIM support, 5G ready, and excellent battery performance.",
    verified: true,
    inStock: true,
    featured: true,
  },
];

export const categories = [
  { name: "Electronics", icon: "📱", count: 1234 },
  { name: "Textiles", icon: "🧵", count: 856 },
  { name: "Food & Beverage", icon: "🍽️", count: 2341 },
  { name: "Construction", icon: "🏗️", count: 567 },
  { name: "Pharmaceuticals", icon: "💊", count: 445 },
  { name: "Automotive", icon: "🚗", count: 789 },
  { name: "Agriculture", icon: "🌾", count: 1123 },
  { name: "Fashion", icon: "👔", count: 934 },
];
