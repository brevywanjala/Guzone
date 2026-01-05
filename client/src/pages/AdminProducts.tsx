import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Image as ImageIcon,
  Package,
  X,
  Plus,
  Trash2,
  Star,
  Power,
  PowerOff,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { productsApi, Product, ProductImage, Category, Offer } from "@/apiRoutes/productsApi";
import { categoriesApi } from "@/apiRoutes/categoriesApi";
import { offersApi } from "@/apiRoutes/offersApi";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

// Mock data for testing
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Premium Coffee Beans",
    description: "High-quality Arabica coffee beans from Kenya",
    price: 29.99,
    discounted_price: null,
    stock_quantity: 150,
    category_id: 1,
    category: { id: 1, name: "Beverages", description: null, is_active: true, created_at: "", updated_at: "" },
    main_image_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
    sku: "COF-001",
    is_active: true,
    is_featured: false,
    discount_percentage: null,
    discount_start_date: null,
    discount_end_date: null,
    offer_id: null,
    offer: null,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    images: [
      { id: 1, product_id: 1, image_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400", alt_text: "Coffee beans", display_order: 1, created_at: "" },
      { id: 2, product_id: 1, image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400", alt_text: "Coffee cup", display_order: 2, created_at: "" },
    ],
  },
  {
    id: 2,
    name: "Organic Tea Leaves",
    description: "Premium organic tea leaves sourced from Tanzania",
    price: 19.99,
    discounted_price: null,
    stock_quantity: 200,
    category_id: 1,
    category: { id: 1, name: "Beverages", description: null, is_active: true, created_at: "", updated_at: "" },
    main_image_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400",
    sku: "TEA-001",
    is_active: true,
    is_featured: false,
    discount_percentage: null,
    discount_start_date: null,
    discount_end_date: null,
    offer_id: null,
    offer: null,
    created_at: "2024-01-16T10:00:00Z",
    updated_at: "2024-01-16T10:00:00Z",
    images: [
      { id: 3, product_id: 2, image_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400", alt_text: "Tea leaves", display_order: 1, created_at: "" },
    ],
  },
  {
    id: 3,
    name: "Handmade Soap Set",
    description: "Natural handmade soaps with essential oils",
    price: 24.99,
    discounted_price: null,
    stock_quantity: 80,
    category_id: 2,
    category: { id: 2, name: "Personal Care", description: null, is_active: true, created_at: "", updated_at: "" },
    main_image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
    sku: "SOAP-001",
    is_active: true,
    is_featured: false,
    discount_percentage: null,
    discount_start_date: null,
    discount_end_date: null,
    offer_id: null,
    offer: null,
    created_at: "2024-01-17T10:00:00Z",
    updated_at: "2024-01-17T10:00:00Z",
    images: [
      { id: 4, product_id: 3, image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400", alt_text: "Soap set", display_order: 1, created_at: "" },
      { id: 5, product_id: 3, image_url: "https://images.unsplash.com/photo-1588421357574-87938a86fa28?w=400", alt_text: "Soap bars", display_order: 2, created_at: "" },
    ],
  },
  {
    id: 4,
    name: "Bamboo Cutting Board",
    description: "Eco-friendly bamboo cutting board",
    price: 34.99,
    discounted_price: null,
    stock_quantity: 45,
    category_id: 3,
    category: { id: 3, name: "Kitchenware", description: null, is_active: true, created_at: "", updated_at: "" },
    main_image_url: "https://images.unsplash.com/photo-1600393589951-80d5aa352829?w=400",
    sku: "KIT-001",
    is_active: false,
    is_featured: false,
    discount_percentage: null,
    discount_start_date: null,
    discount_end_date: null,
    offer_id: null,
    offer: null,
    created_at: "2024-01-18T10:00:00Z",
    updated_at: "2024-01-18T10:00:00Z",
    images: [
      { id: 6, product_id: 4, image_url: "https://images.unsplash.com/photo-1600393589951-80d5aa352829?w=400", alt_text: "Cutting board", display_order: 1, created_at: "" },
    ],
  },
];

export default function AdminProducts() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [offersLoading, setOffersLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteImageConfirmOpen, setDeleteImageConfirmOpen] = useState(false);
  const [deleteProductConfirmOpen, setDeleteProductConfirmOpen] = useState(false);
  const [deleteCategoryConfirmOpen, setDeleteCategoryConfirmOpen] = useState(false);
  const [deleteOfferConfirmOpen, setDeleteOfferConfirmOpen] = useState(false);
  const [deactivateProductConfirmOpen, setDeactivateProductConfirmOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{ productId: number; imageId?: number; imageUrl: string } | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productToDeactivate, setProductToDeactivate] = useState<Product | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [categoryEditDialogOpen, setCategoryEditDialogOpen] = useState(false);
  const [categoryAddDialogOpen, setCategoryAddDialogOpen] = useState(false);
  const [offerEditDialogOpen, setOfferEditDialogOpen] = useState(false);
  const [offerAddDialogOpen, setOfferAddDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });
  const [offerFormData, setOfferFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    sku: "",
    category_id: "",
    is_active: true,
    is_featured: false,
    main_image_url: "",
    minimum_order: "",
    unit_term: "",
    location: "",
    supplier_name: "",
    discount_percentage: "",
    discount_start_date: "",
    discount_end_date: "",
    offer_id: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    fetchProducts();
    fetchCategories();
    fetchOffers();
  }, [isAuthenticated, navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productsApi.getProducts({ per_page: 100 });
      setProducts(response.products);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await categoriesApi.getCategories();
      setCategories(data);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchOffers = async () => {
    setOffersLoading(true);
    try {
      const data = await offersApi.getOffers();
      setOffers(data);
    } catch (error: any) {
      console.error("Error fetching offers:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load offers",
        variant: "destructive",
      });
    } finally {
      setOffersLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditing(true);
    const images = getProductImages(product);
    setProductImages(images);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      sku: product.sku || "",
      is_active: product.is_active,
      main_image_url: product.main_image_url || "",
      minimum_order: (product.minimum_order || 1).toString(),
      unit_term: product.unit_term || "units",
      location: product.item_location || "",
      supplier_name: product.supplier_name || "",
      category_id: product.category_id?.toString() || "",
      is_featured: product.is_featured || false,
      discount_percentage: product.discount_percentage?.toString() || "",
      discount_start_date: product.discount_start_date ? product.discount_start_date.split('T')[0] : "",
      discount_end_date: product.discount_end_date ? product.discount_end_date.split('T')[0] : "",
      offer_id: product.offer_id?.toString() || "",
    });
    setEditDialogOpen(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsEditing(false);
    setProductImages([]);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock_quantity: "",
      sku: "",
      is_active: true,
      main_image_url: "",
      minimum_order: "",
      unit_term: "units",
      location: "",
      supplier_name: "",
      category_id: "",
      is_featured: false,
      discount_percentage: "",
      discount_start_date: "",
      discount_end_date: "",
      offer_id: "",
    });
    setAddDialogOpen(true);
  };

  const handleAddImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const result = await productsApi.uploadProductImage(file);
          const imageUrl = result.image_url;
          const updatedImages = [...productImages, imageUrl];
          setProductImages(updatedImages);
          // If this is the first image, set it as main
          if (productImages.length === 0) {
            setFormData({ ...formData, main_image_url: imageUrl });
          }
          
          // If editing, automatically save the changes
          if (isEditing && selectedProduct) {
            try {
              const productData: any = {
                name: formData.name,
                description: formData.description || undefined,
                price: parseFloat(formData.price),
                stock_quantity: parseInt(formData.stock_quantity) || 0,
                sku: formData.sku || undefined,
                is_active: formData.is_active,
                main_image_url: formData.main_image_url || imageUrl || undefined,
                minimum_order: formData.minimum_order ? parseInt(formData.minimum_order) : undefined,
                unit_term: formData.unit_term || undefined,
                item_location: formData.location || undefined,
                supplier_name: formData.supplier_name || undefined,
                category_id: formData.category_id ? parseInt(formData.category_id) : undefined,
                is_featured: formData.is_featured,
                discount_percentage: formData.discount_percentage ? parseFloat(formData.discount_percentage) : undefined,
                discount_start_date: formData.discount_start_date ? `${formData.discount_start_date}T00:00:00Z` : undefined,
                discount_end_date: formData.discount_end_date ? `${formData.discount_end_date}T23:59:59Z` : undefined,
                offer_id: formData.offer_id ? parseInt(formData.offer_id) : undefined,
                images: updatedImages.map((url, idx) => ({
                  image_url: url,
                  display_order: idx,
                })),
              };
              
              await productsApi.updateProduct(selectedProduct.id, productData);
              
              // Refresh product data to get updated images
              const updatedProduct = await productsApi.getProduct(selectedProduct.id);
              const updatedImagesList = getProductImages(updatedProduct);
              setProductImages(updatedImagesList);
              setSelectedProduct(updatedProduct);
              
              toast({
                title: "Success",
                description: "Image uploaded and saved successfully",
              });
            } catch (saveError: any) {
              console.error("Error saving image:", saveError);
              toast({
                title: "Warning",
                description: "Image uploaded but failed to save. Please click Save Changes.",
                variant: "destructive",
              });
            }
          } else {
            toast({
              title: "Success",
              description: "Image uploaded successfully",
            });
          }
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.response?.data?.error || "Failed to upload image",
            variant: "destructive",
          });
        }
      }
    };
    input.click();
  };

  const handleDeleteImage = (imageUrl: string, imageId?: number) => {
    if (isEditing && selectedProduct && imageId) {
      // Find the image in the product's images array
      const image = selectedProduct.images.find(img => img.id === imageId);
      if (image) {
        setImageToDelete({ productId: selectedProduct.id, imageId: image.id, imageUrl: image.image_url });
        setDeleteImageConfirmOpen(true);
      }
    } else {
      // For new products, just remove from local state
      const updatedImages = productImages.filter(img => img !== imageUrl);
      setProductImages(updatedImages);
      
      // If deleted image was the main image, set first remaining image as main
      if (formData.main_image_url === imageUrl) {
        setFormData({
          ...formData,
          main_image_url: updatedImages.length > 0 ? updatedImages[0] : "",
        });
      }
    }
  };

  const confirmDeleteImage = async () => {
    if (!imageToDelete) return;

    try {
      if (imageToDelete.imageId && imageToDelete.productId) {
        // Delete from backend
        await productsApi.deleteProductImage(imageToDelete.productId, imageToDelete.imageId);
        toast({
          title: "Success",
          description: "Image deleted successfully",
        });
        // Refresh product data
        if (selectedProduct) {
          const updatedProduct = await productsApi.getProduct(selectedProduct.id);
          const images = getProductImages(updatedProduct);
          setProductImages(images);
          setSelectedProduct(updatedProduct);
        }
        fetchProducts();
      } else {
        // For new products, just remove from local state
        const updatedImages = productImages.filter(img => img !== imageToDelete.imageUrl);
        setProductImages(updatedImages);
        
        // If deleted image was the main image, set first remaining image as main
        if (formData.main_image_url === imageToDelete.imageUrl) {
          setFormData({
            ...formData,
            main_image_url: updatedImages.length > 0 ? updatedImages[0] : "",
          });
        }
      }
      
      setDeleteImageConfirmOpen(false);
      setImageToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const handleSetMainImage = (imageUrl: string) => {
    setFormData({ ...formData, main_image_url: imageUrl });
  };

  const handleSave = async () => {
    if (isEditing && !selectedProduct) return;
    if (!formData.name || !formData.price) {
      toast({
        title: "Error",
        description: "Name and price are required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const productData: any = {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        sku: formData.sku || undefined,
        is_active: formData.is_active,
        main_image_url: formData.main_image_url || undefined,
        minimum_order: formData.minimum_order ? parseInt(formData.minimum_order) : undefined,
        unit_term: formData.unit_term || undefined,
        item_location: formData.location || undefined,
        supplier_name: formData.supplier_name || undefined,
        category_id: formData.category_id ? parseInt(formData.category_id) : undefined,
        is_featured: formData.is_featured,
        discount_percentage: formData.discount_percentage ? parseFloat(formData.discount_percentage) : undefined,
        discount_start_date: formData.discount_start_date ? `${formData.discount_start_date}T00:00:00Z` : undefined,
        discount_end_date: formData.discount_end_date ? `${formData.discount_end_date}T23:59:59Z` : undefined,
        offer_id: formData.offer_id ? parseInt(formData.offer_id) : undefined,
        images: productImages.map((url, idx) => ({
          image_url: url,
          display_order: idx,
        })),
      };

      if (isEditing) {
        await productsApi.updateProduct(selectedProduct!.id, productData);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
        setEditDialogOpen(false);
      } else {
        await productsApi.createProduct(productData);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
        setAddDialogOpen(false);
      }
      
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getProductImages = (product: Product): string[] => {
    const imageUrls: string[] = [];
    if (product.images && product.images.length > 0) {
      // Sort by display_order and collect URLs
      const sortedImages = [...product.images].sort((a, b) => a.display_order - b.display_order);
      sortedImages.forEach((img) => {
        imageUrls.push(img.image_url);
      });
    }
    // Add main_image_url if it's not already in the list
    if (product.main_image_url && !imageUrls.includes(product.main_image_url)) {
      imageUrls.unshift(product.main_image_url);
    }
    return imageUrls.length > 0 ? imageUrls : [];
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await productsApi.deleteProduct(productToDelete.id);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      setDeleteProductConfirmOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleToggleProductActive = (product: Product) => {
    // If activating, do it immediately without confirmation
    if (!product.is_active) {
      confirmActivateProduct(product);
    } else {
      // If deactivating, show confirmation dialog
      setProductToDeactivate(product);
      setDeactivateProductConfirmOpen(true);
    }
  };

  const confirmActivateProduct = async (product: Product) => {
    try {
      const updatedProduct = await productsApi.updateProduct(product.id, {
        is_active: true,
      });
      toast({
        title: "Success",
        description: "Product activated successfully",
      });
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to activate product",
        variant: "destructive",
      });
    }
  };

  const confirmDeactivateProduct = async () => {
    if (!productToDeactivate) return;

    try {
      const updatedProduct = await productsApi.updateProduct(productToDeactivate.id, {
        is_active: false,
      });
      toast({
        title: "Success",
        description: "Product deactivated successfully",
      });
      setDeactivateProductConfirmOpen(false);
      setProductToDeactivate(null);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to deactivate product",
        variant: "destructive",
      });
    }
  };

  const getImageId = (imageUrl: string): number | undefined => {
    if (selectedProduct && selectedProduct.images) {
      const image = selectedProduct.images.find(img => img.image_url === imageUrl);
      return image?.id;
    }
    return undefined;
  };

  const getImageUrl = (imageUrl: string): string => {
    // If it's a local upload, prepend the backend URL
    if (imageUrl && imageUrl.startsWith('/api/products/uploads/')) {
      const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      return `${apiBaseUrl}${imageUrl.replace('/api', '')}`;
    }
    return imageUrl;
  };

  // Category management handlers
  const handleAddCategory = () => {
    setSelectedCategory(null);
    setCategoryFormData({
      name: "",
      description: "",
      is_active: true,
    });
    setCategoryAddDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
      is_active: category.is_active,
    });
    setCategoryEditDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryFormData.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (selectedCategory) {
        await categoriesApi.updateCategory(selectedCategory.id, categoryFormData);
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
        setCategoryEditDialogOpen(false);
      } else {
        await categoriesApi.createCategory(categoryFormData);
        toast({
          title: "Success",
          description: "Category created successfully",
        });
        setCategoryAddDialogOpen(false);
      }
      await fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save category",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await categoriesApi.deleteCategory(categoryToDelete.id);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      setDeleteCategoryConfirmOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  // Offer management handlers
  const handleAddOffer = () => {
    setSelectedOffer(null);
    setOfferFormData({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      is_active: true,
    });
    setOfferAddDialogOpen(true);
  };

  const handleEditOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setOfferFormData({
      name: offer.name,
      description: offer.description || "",
      start_date: offer.start_date ? offer.start_date.split('T')[0] : "",
      end_date: offer.end_date ? offer.end_date.split('T')[0] : "",
      is_active: offer.is_active,
    });
    setOfferEditDialogOpen(true);
  };

  const handleSaveOffer = async () => {
    if (!offerFormData.name.trim()) {
      toast({
        title: "Error",
        description: "Offer name is required",
        variant: "destructive",
      });
      return;
    }

    if (!offerFormData.start_date || !offerFormData.end_date) {
      toast({
        title: "Error",
        description: "Start date and end date are required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const offerData = {
        name: offerFormData.name,
        description: offerFormData.description || undefined,
        start_date: `${offerFormData.start_date}T00:00:00Z`,
        end_date: `${offerFormData.end_date}T23:59:59Z`,
        is_active: offerFormData.is_active,
      };

      if (selectedOffer) {
        await offersApi.updateOffer(selectedOffer.id, offerData);
        toast({
          title: "Success",
          description: "Offer updated successfully",
        });
        setOfferEditDialogOpen(false);
      } else {
        await offersApi.createOffer(offerData);
        toast({
          title: "Success",
          description: "Offer created successfully",
        });
        setOfferAddDialogOpen(false);
      }
      await fetchOffers();
      await fetchProducts(); // Refresh products to update offer references
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save offer",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOffer = async () => {
    if (!offerToDelete) return;

    try {
      await offersApi.deleteOffer(offerToDelete.id);
      toast({
        title: "Success",
        description: "Offer deleted successfully",
      });
      setDeleteOfferConfirmOpen(false);
      setOfferToDelete(null);
      fetchOffers();
      await fetchProducts(); // Refresh products to remove offer references
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete offer",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cyan-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      <main className="flex-1 relative">
        {/* Animated gradient background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-60 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-60 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container py-8 relative z-10">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/admin")}
                  className="text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-800/50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Products Management
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">
                    Manage all products in your store
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs for Products, Categories, and Offers */}
            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-white/50 dark:bg-slate-800/50 border-2 border-emerald-200/50 dark:border-emerald-800/50 mb-6">
                <TabsTrigger 
                  value="products"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white font-semibold"
                >
                  Products
                </TabsTrigger>
                <TabsTrigger 
                  value="categories"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white font-semibold"
                >
                  Categories
                </TabsTrigger>
                <TabsTrigger 
                  value="offers"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white font-semibold"
                >
                  Offers
                </TabsTrigger>
              </TabsList>

              {/* Products Tab */}
              <TabsContent value="products">
            {/* Products Table */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-xl shadow-emerald-500/10">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    All Products ({products.length})
                  </h2>
                  <Button
                    onClick={handleAddProduct}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/25"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
                    <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">Loading products...</p>
                  </div>
                ) : (
                  <div className="border-2 border-emerald-200/50 dark:border-emerald-800/50 rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border-b-2 border-emerald-200 dark:border-emerald-800">
                          <TableHead className="font-bold text-gray-900 dark:text-white">Image</TableHead>
                          <TableHead className="font-bold text-gray-900 dark:text-white">Name</TableHead>
                          <TableHead className="font-bold text-gray-900 dark:text-white">SKU</TableHead>
                          <TableHead className="font-bold text-gray-900 dark:text-white">Category</TableHead>
                          <TableHead className="font-bold text-gray-900 dark:text-white">Price</TableHead>
                          <TableHead className="font-bold text-gray-900 dark:text-white">Stock</TableHead>
                          <TableHead className="font-bold text-gray-900 dark:text-white">Status</TableHead>
                          <TableHead className="font-bold text-gray-900 dark:text-white">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-12 text-gray-500 dark:text-gray-400">
                              No products found. Click "Add Product" to create your first product.
                            </TableCell>
                          </TableRow>
                        ) : (
                          products.map((product) => {
                        const images = getProductImages(product);
                        const mainImage = images[0] || "/placeholder-product.jpg";
                        
                        return (
                          <TableRow
                            key={product.id}
                            className="hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 transition-colors"
                          >
                            <TableCell>
                              <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-emerald-200 dark:border-emerald-800">
                                {mainImage ? (
                                  <img
                                    src={getImageUrl(mainImage)}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                                {product.description && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                    {product.description}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm text-gray-700 dark:text-gray-300">
                              {product.sku || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700 border font-semibold shadow-sm">
                                {product.category?.name || "Uncategorized"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-gray-900 dark:text-white">
                              ${product.price.toFixed(2)}
                            </TableCell>
                            <TableCell className="font-semibold text-gray-700 dark:text-gray-300">
                              {product.stock_quantity}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${
                                  product.is_active
                                    ? "bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700"
                                    : "bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700"
                                } border font-semibold shadow-sm`}
                              >
                                {product.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(product)}
                                  className="border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-300"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleProductActive(product)}
                                  className={product.is_active 
                                    ? "border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-400 dark:hover:border-orange-600 hover:text-orange-700 dark:hover:text-orange-300"
                                    : "border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-400 dark:hover:border-green-600 hover:text-green-700 dark:hover:text-green-300"
                                  }
                                  title={product.is_active ? "Deactivate Product" : "Activate Product"}
                                >
                                  {product.is_active ? (
                                    <>
                                      <PowerOff className="h-4 w-4 mr-1" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <Power className="h-4 w-4 mr-1" />
                                      Activate
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setProductToDelete(product);
                                    setDeleteProductConfirmOpen(true);
                                  }}
                                  className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-600 hover:text-red-700 dark:hover:text-red-300"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          );
                        })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </Card>
              </TabsContent>

              {/* Categories Tab */}
              <TabsContent value="categories">
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-xl shadow-emerald-500/10">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        All Categories ({categories.length})
                      </h2>
                      <Button
                        onClick={handleAddCategory}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/25"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                      </Button>
                    </div>

                    {categoriesLoading ? (
                      <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
                        <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">Loading categories...</p>
                      </div>
                    ) : (
                      <div className="border-2 border-emerald-200/50 dark:border-emerald-800/50 rounded-xl overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border-b-2 border-emerald-200 dark:border-emerald-800">
                              <TableHead className="font-bold text-gray-900 dark:text-white">Name</TableHead>
                              <TableHead className="font-bold text-gray-900 dark:text-white">Description</TableHead>
                              <TableHead className="font-bold text-gray-900 dark:text-white">Status</TableHead>
                              <TableHead className="font-bold text-gray-900 dark:text-white">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {categories.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-12 text-gray-500 dark:text-gray-400">
                                  No categories found. Click "Add Category" to create your first category.
                                </TableCell>
                              </TableRow>
                            ) : (
                              categories.map((category) => (
                                <TableRow
                                  key={category.id}
                                  className="hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 transition-colors"
                                >
                                  <TableCell className="font-semibold text-gray-900 dark:text-white">
                                    {category.name}
                                  </TableCell>
                                  <TableCell className="text-gray-700 dark:text-gray-300">
                                    {category.description || "No description"}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={`${
                                        category.is_active
                                          ? "bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700"
                                          : "bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700"
                                      } border font-semibold shadow-sm`}
                                    >
                                      {category.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditCategory(category)}
                                        className="border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-300"
                                      >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setCategoryToDelete(category);
                                          setDeleteCategoryConfirmOpen(true);
                                        }}
                                        className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-600 hover:text-red-700 dark:hover:text-red-300"
                                      >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* Offers Tab */}
              <TabsContent value="offers">
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-xl shadow-emerald-500/10">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        All Offers ({offers.length})
                      </h2>
                      <Button
                        onClick={handleAddOffer}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/25"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Offer
                      </Button>
                    </div>

                    {offersLoading ? (
                      <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
                        <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">Loading offers...</p>
                      </div>
                    ) : (
                      <div className="border-2 border-emerald-200/50 dark:border-emerald-800/50 rounded-xl overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border-b-2 border-emerald-200 dark:border-emerald-800">
                              <TableHead className="font-bold text-gray-900 dark:text-white">Name</TableHead>
                              <TableHead className="font-bold text-gray-900 dark:text-white">Description</TableHead>
                              <TableHead className="font-bold text-gray-900 dark:text-white">Start Date</TableHead>
                              <TableHead className="font-bold text-gray-900 dark:text-white">End Date</TableHead>
                              <TableHead className="font-bold text-gray-900 dark:text-white">Status</TableHead>
                              <TableHead className="font-bold text-gray-900 dark:text-white">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {offers.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-gray-500 dark:text-gray-400">
                                  No offers found. Click "Add Offer" to create your first offer.
                                </TableCell>
                              </TableRow>
                            ) : (
                              offers.map((offer) => (
                                <TableRow
                                  key={offer.id}
                                  className="hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 transition-colors"
                                >
                                  <TableCell className="font-semibold text-gray-900 dark:text-white">
                                    {offer.name}
                                  </TableCell>
                                  <TableCell className="text-gray-700 dark:text-gray-300">
                                    {offer.description || "No description"}
                                  </TableCell>
                                  <TableCell className="text-gray-700 dark:text-gray-300">
                                    {new Date(offer.start_date).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="text-gray-700 dark:text-gray-300">
                                    {new Date(offer.end_date).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={`${
                                        offer.is_active
                                          ? "bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700"
                                          : "bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700"
                                      } border font-semibold shadow-sm`}
                                    >
                                      {offer.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditOffer(offer)}
                                        className="border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-300"
                                      >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setOfferToDelete(offer);
                                          setDeleteOfferConfirmOpen(true);
                                        }}
                                        className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-600 hover:text-red-700 dark:hover:text-red-300"
                                      >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Edit Product Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setSelectedProduct(null);
            setProductImages([]);
          }
        }}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-2xl shadow-emerald-500/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Edit Product
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Update product information and images
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Image Preview Section */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-gray-900 dark:text-white">
                Product Images
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-800/50">
                {productImages.map((img, index) => {
                  const isMain = formData.main_image_url === img;
                  return (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border-2 border-emerald-300 dark:border-emerald-700 bg-gray-100 dark:bg-gray-800">
                        <img
                          src={getImageUrl(img)}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                          }}
                        />
                      </div>
                      {/* Main Badge */}
                      {isMain && (
                        <Badge className="absolute top-2 left-2 bg-emerald-500 text-white border-0 shadow-lg">
                          <Star className="h-3 w-3 mr-1" />
                          Main
                        </Badge>
                      )}
                      {/* Delete Button */}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        onClick={() => handleDeleteImage(img, getImageId(img))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {/* Set as Main Button */}
                      {!isMain && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-800/90 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          onClick={() => handleSetMainImage(img)}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Set Main
                        </Button>
                      )}
                    </div>
                  );
                })}
                {/* Add Image Button */}
                <button
                  onClick={handleAddImage}
                  className="aspect-square rounded-lg border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-gray-50 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors flex items-center justify-center group"
                >
                  <div className="text-center">
                    <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors mx-auto mb-2">
                      <Plus className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Add Image</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold text-gray-700 dark:text-gray-300">
                  Product Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku" className="font-semibold text-gray-700 dark:text-gray-300">
                  SKU
                </Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  placeholder="e.g., PROD-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="font-semibold text-gray-700 dark:text-gray-300">
                  Category
                </Label>
                <Select
                  value={formData.category_id || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger
                    id="category"
                    className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.filter(cat => cat.is_active).map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="font-semibold text-gray-700 dark:text-gray-300">
                  Price *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock" className="font-semibold text-gray-700 dark:text-gray-300">
                  Stock Quantity *
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="font-semibold text-gray-700 dark:text-gray-300">
                  Status
                </Label>
                <Select
                  value={formData.is_active ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, is_active: value === "active" })
                  }
                >
                  <SelectTrigger
                    id="status"
                    className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimum_order" className="font-semibold text-gray-700 dark:text-gray-300">
                  Minimum Order
                </Label>
                <Input
                  id="minimum_order"
                  type="number"
                  value={formData.minimum_order}
                  onChange={(e) => setFormData({ ...formData, minimum_order: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_term" className="font-semibold text-gray-700 dark:text-gray-300">
                  Unit Term
                </Label>
                <Select
                  value={formData.unit_term}
                  onValueChange={(value) => setFormData({ ...formData, unit_term: value })}
                >
                  <SelectTrigger
                    id="unit_term"
                    className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  >
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="units">Units</SelectItem>
                    <SelectItem value="bags">Bags</SelectItem>
                    <SelectItem value="sacks">Sacks</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="packs">Packs</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="tons">Tons</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="font-semibold text-gray-700 dark:text-gray-300">
                  Item Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  placeholder="e.g., Nairobi, Kenya"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier_name" className="font-semibold text-gray-700 dark:text-gray-300">
                  Supplier Name
                </Label>
                <Input
                  id="supplier_name"
                  value={formData.supplier_name}
                  onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  placeholder="e.g., ABC Suppliers Ltd"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked === true })}
                  />
                  <Label htmlFor="is_featured" className="font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                    Featured Product
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="offer" className="font-semibold text-gray-700 dark:text-gray-300">
                  Offer/Campaign
                </Label>
                <Select
                  value={formData.offer_id || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, offer_id: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger
                    id="offer"
                    className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  >
                    <SelectValue placeholder="Select offer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Offer</SelectItem>
                    {offers.filter(offer => offer.is_active).map((offer) => (
                      <SelectItem key={offer.id} value={offer.id.toString()}>
                        {offer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_percentage" className="font-semibold text-gray-700 dark:text-gray-300">
                  Discount Percentage (%)
                </Label>
                <Input
                  id="discount_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  placeholder="e.g., 15"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_start_date" className="font-semibold text-gray-700 dark:text-gray-300">
                  Discount Start Date
                </Label>
                <Input
                  id="discount_start_date"
                  type="date"
                  value={formData.discount_start_date}
                  onChange={(e) => setFormData({ ...formData, discount_start_date: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_end_date" className="font-semibold text-gray-700 dark:text-gray-300">
                  Discount End Date
                </Label>
                <Input
                  id="discount_end_date"
                  type="date"
                  value={formData.discount_end_date}
                  onChange={(e) => setFormData({ ...formData, discount_end_date: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold text-gray-700 dark:text-gray-300">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                placeholder="Enter product description..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-emerald-200/50 dark:border-emerald-800/50">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="border-gray-300 dark:border-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/25"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog 
        open={addDialogOpen} 
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) {
            setProductImages([]);
          }
        }}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-2xl shadow-emerald-500/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Add New Product
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Create a new product in your store
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Image Preview Section */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-gray-900 dark:text-white">
                Product Images
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-800/50">
                {productImages.map((img, index) => {
                  const isMain = formData.main_image_url === img;
                  return (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border-2 border-emerald-300 dark:border-emerald-700 bg-gray-100 dark:bg-gray-800">
                        <img
                          src={getImageUrl(img)}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                          }}
                        />
                      </div>
                      {/* Main Badge */}
                      {isMain && (
                        <Badge className="absolute top-2 left-2 bg-emerald-500 text-white border-0 shadow-lg">
                          <Star className="h-3 w-3 mr-1" />
                          Main
                        </Badge>
                      )}
                      {/* Delete Button */}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        onClick={() => handleDeleteImage(img, getImageId(img))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {/* Set as Main Button */}
                      {!isMain && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-800/90 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          onClick={() => handleSetMainImage(img)}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Set Main
                        </Button>
                      )}
                    </div>
                  );
                })}
                {/* Add Image Button */}
                <button
                  onClick={handleAddImage}
                  className="aspect-square rounded-lg border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-gray-50 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors flex items-center justify-center group"
                >
                  <div className="text-center">
                    <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors mx-auto mb-2">
                      <Plus className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Add Image</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Form Fields - Same as edit dialog */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="add-name" className="font-semibold text-gray-700 dark:text-gray-300">
                  Product Name *
                </Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-sku" className="font-semibold text-gray-700 dark:text-gray-300">
                  SKU
                </Label>
                <Input
                  id="add-sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  placeholder="e.g., PROD-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-category" className="font-semibold text-gray-700 dark:text-gray-300">
                  Category
                </Label>
                <Select
                  value={formData.category_id || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger
                    id="add-category"
                    className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.filter(cat => cat.is_active).map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-price" className="font-semibold text-gray-700 dark:text-gray-300">
                  Price *
                </Label>
                <Input
                  id="add-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-stock" className="font-semibold text-gray-700 dark:text-gray-300">
                  Stock Quantity *
                </Label>
                <Input
                  id="add-stock"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-status" className="font-semibold text-gray-700 dark:text-gray-300">
                  Status
                </Label>
                <Select
                  value={formData.is_active ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, is_active: value === "active" })
                  }
                >
                  <SelectTrigger
                    id="add-status"
                    className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-minimum_order" className="font-semibold text-gray-700 dark:text-gray-300">
                  Minimum Order
                </Label>
                <Input
                  id="add-minimum_order"
                  type="number"
                  value={formData.minimum_order}
                  onChange={(e) => setFormData({ ...formData, minimum_order: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-unit_term" className="font-semibold text-gray-700 dark:text-gray-300">
                  Unit Term
                </Label>
                <Select
                  value={formData.unit_term}
                  onValueChange={(value) => setFormData({ ...formData, unit_term: value })}
                >
                  <SelectTrigger
                    id="add-unit_term"
                    className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  >
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="units">Units</SelectItem>
                    <SelectItem value="bags">Bags</SelectItem>
                    <SelectItem value="sacks">Sacks</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="packs">Packs</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="tons">Tons</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-location" className="font-semibold text-gray-700 dark:text-gray-300">
                  Item Location
                </Label>
                <Input
                  id="add-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  placeholder="e.g., Nairobi, Kenya"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-supplier_name" className="font-semibold text-gray-700 dark:text-gray-300">
                  Supplier Name
                </Label>
                <Input
                  id="add-supplier_name"
                  value={formData.supplier_name}
                  onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  placeholder="e.g., ABC Suppliers Ltd"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="add-is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked === true })}
                  />
                  <Label htmlFor="add-is_featured" className="font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                    Featured Product
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-offer" className="font-semibold text-gray-700 dark:text-gray-300">
                  Offer/Campaign
                </Label>
                <Select
                  value={formData.offer_id || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, offer_id: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger
                    id="add-offer"
                    className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  >
                    <SelectValue placeholder="Select offer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Offer</SelectItem>
                    {offers.filter(offer => offer.is_active).map((offer) => (
                      <SelectItem key={offer.id} value={offer.id.toString()}>
                        {offer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-discount_percentage" className="font-semibold text-gray-700 dark:text-gray-300">
                  Discount Percentage (%)
                </Label>
                <Input
                  id="add-discount_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                  placeholder="e.g., 15"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-discount_start_date" className="font-semibold text-gray-700 dark:text-gray-300">
                  Discount Start Date
                </Label>
                <Input
                  id="add-discount_start_date"
                  type="date"
                  value={formData.discount_start_date}
                  onChange={(e) => setFormData({ ...formData, discount_start_date: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-discount_end_date" className="font-semibold text-gray-700 dark:text-gray-300">
                  Discount End Date
                </Label>
                <Input
                  id="add-discount_end_date"
                  type="date"
                  value={formData.discount_end_date}
                  onChange={(e) => setFormData({ ...formData, discount_end_date: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-description" className="font-semibold text-gray-700 dark:text-gray-300">
                Description
              </Label>
              <Textarea
                id="add-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                placeholder="Enter product description..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-emerald-200/50 dark:border-emerald-800/50">
              <Button
                variant="outline"
                onClick={() => setAddDialogOpen(false)}
                className="border-gray-300 dark:border-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/25"
              >
                Add Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Image Confirmation Dialog */}
      <Dialog open={deleteImageConfirmOpen} onOpenChange={setDeleteImageConfirmOpen}>
        <DialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-red-200/50 dark:border-red-800/50 shadow-2xl shadow-red-500/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Delete Image
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this image? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteImageConfirmOpen(false);
                setImageToDelete(null);
              }}
              className="border-gray-300 dark:border-gray-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteImage}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-red-500/25"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation Dialog */}
      <Dialog open={deleteProductConfirmOpen} onOpenChange={setDeleteProductConfirmOpen}>
        <DialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-red-200/50 dark:border-red-800/50 shadow-2xl shadow-red-500/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Delete Product
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete the product "{productToDelete?.name}"? This action cannot be undone and will remove all associated images and data.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteProductConfirmOpen(false);
                setProductToDelete(null);
              }}
              className="border-gray-300 dark:border-gray-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-red-500/25"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deactivate Product Confirmation Dialog */}
      <Dialog open={deactivateProductConfirmOpen} onOpenChange={setDeactivateProductConfirmOpen}>
        <DialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-orange-200/50 dark:border-orange-800/50 shadow-2xl shadow-orange-500/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Deactivate Product
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to deactivate the product "{productToDeactivate?.name}"? This will hide it from customers on the landing page and products page. You can reactivate it later.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeactivateProductConfirmOpen(false);
                setProductToDeactivate(null);
              }}
              className="border-gray-300 dark:border-gray-700"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={confirmDeactivateProduct}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-lg shadow-orange-500/25"
            >
              Deactivate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={categoryAddDialogOpen} onOpenChange={setCategoryAddDialogOpen}>
        <DialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-2xl shadow-emerald-500/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Add New Category
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Create a new product category
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name" className="font-semibold text-gray-700 dark:text-gray-300">
                Category Name *
              </Label>
              <Input
                id="category-name"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                placeholder="e.g., Electronics"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-description" className="font-semibold text-gray-700 dark:text-gray-300">
                Description
              </Label>
              <Textarea
                id="category-description"
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                placeholder="Category description..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-status" className="font-semibold text-gray-700 dark:text-gray-300">
                Status
              </Label>
              <Select
                value={categoryFormData.is_active ? "active" : "inactive"}
                onValueChange={(value) =>
                  setCategoryFormData({ ...categoryFormData, is_active: value === "active" })
                }
              >
                <SelectTrigger
                  id="category-status"
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-emerald-200/50 dark:border-emerald-800/50">
              <Button
                variant="outline"
                onClick={() => setCategoryAddDialogOpen(false)}
                className="border-gray-300 dark:border-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCategory}
                disabled={saving}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/25 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Add Category"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={categoryEditDialogOpen} onOpenChange={setCategoryEditDialogOpen}>
        <DialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-2xl shadow-emerald-500/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Edit Category
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Update category information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name" className="font-semibold text-gray-700 dark:text-gray-300">
                Category Name *
              </Label>
              <Input
                id="edit-category-name"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                placeholder="e.g., Electronics"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category-description" className="font-semibold text-gray-700 dark:text-gray-300">
                Description
              </Label>
              <Textarea
                id="edit-category-description"
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                placeholder="Category description..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category-status" className="font-semibold text-gray-700 dark:text-gray-300">
                Status
              </Label>
              <Select
                value={categoryFormData.is_active ? "active" : "inactive"}
                onValueChange={(value) =>
                  setCategoryFormData({ ...categoryFormData, is_active: value === "active" })
                }
              >
                <SelectTrigger
                  id="edit-category-status"
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-emerald-200/50 dark:border-emerald-800/50">
              <Button
                variant="outline"
                onClick={() => setCategoryEditDialogOpen(false)}
                className="border-gray-300 dark:border-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCategory}
                disabled={saving}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/25 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <Dialog open={deleteCategoryConfirmOpen} onOpenChange={setDeleteCategoryConfirmOpen}>
        <DialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-red-200/50 dark:border-red-800/50 shadow-2xl shadow-red-500/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Delete Category
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete the category "{categoryToDelete?.name}"? This action cannot be undone. Categories with associated products cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteCategoryConfirmOpen(false);
                setCategoryToDelete(null);
              }}
              className="border-gray-300 dark:border-gray-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-red-500/25"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Offer Dialog */}
      <Dialog open={offerAddDialogOpen} onOpenChange={setOfferAddDialogOpen}>
        <DialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-2xl shadow-emerald-500/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Add New Offer
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Create a new offer/campaign (e.g., Black Friday, Christmas Sale)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="offer-name" className="font-semibold text-gray-700 dark:text-gray-300">
                Offer Name *
              </Label>
              <Input
                id="offer-name"
                value={offerFormData.name}
                onChange={(e) => setOfferFormData({ ...offerFormData, name: e.target.value })}
                className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                placeholder="e.g., Black Friday, Christmas Sale"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="offer-description" className="font-semibold text-gray-700 dark:text-gray-300">
                Description
              </Label>
              <Textarea
                id="offer-description"
                value={offerFormData.description}
                onChange={(e) => setOfferFormData({ ...offerFormData, description: e.target.value })}
                className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                placeholder="Offer description..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="offer-start-date" className="font-semibold text-gray-700 dark:text-gray-300">
                  Start Date *
                </Label>
                <Input
                  id="offer-start-date"
                  type="date"
                  value={offerFormData.start_date}
                  onChange={(e) => setOfferFormData({ ...offerFormData, start_date: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offer-end-date" className="font-semibold text-gray-700 dark:text-gray-300">
                  End Date *
                </Label>
                <Input
                  id="offer-end-date"
                  type="date"
                  value={offerFormData.end_date}
                  onChange={(e) => setOfferFormData({ ...offerFormData, end_date: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="offer-status" className="font-semibold text-gray-700 dark:text-gray-300">
                Status
              </Label>
              <Select
                value={offerFormData.is_active ? "active" : "inactive"}
                onValueChange={(value) =>
                  setOfferFormData({ ...offerFormData, is_active: value === "active" })
                }
              >
                <SelectTrigger
                  id="offer-status"
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-emerald-200/50 dark:border-emerald-800/50">
              <Button
                variant="outline"
                onClick={() => setOfferAddDialogOpen(false)}
                className="border-gray-300 dark:border-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveOffer}
                disabled={saving}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/25 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Add Offer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Offer Dialog */}
      <Dialog open={offerEditDialogOpen} onOpenChange={setOfferEditDialogOpen}>
        <DialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-2xl shadow-emerald-500/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Edit Offer
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Update offer/campaign information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-offer-name" className="font-semibold text-gray-700 dark:text-gray-300">
                Offer Name *
              </Label>
              <Input
                id="edit-offer-name"
                value={offerFormData.name}
                onChange={(e) => setOfferFormData({ ...offerFormData, name: e.target.value })}
                className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                placeholder="e.g., Black Friday, Christmas Sale"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-offer-description" className="font-semibold text-gray-700 dark:text-gray-300">
                Description
              </Label>
              <Textarea
                id="edit-offer-description"
                value={offerFormData.description}
                onChange={(e) => setOfferFormData({ ...offerFormData, description: e.target.value })}
                className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                placeholder="Offer description..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-offer-start-date" className="font-semibold text-gray-700 dark:text-gray-300">
                  Start Date *
                </Label>
                <Input
                  id="edit-offer-start-date"
                  type="date"
                  value={offerFormData.start_date}
                  onChange={(e) => setOfferFormData({ ...offerFormData, start_date: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-offer-end-date" className="font-semibold text-gray-700 dark:text-gray-300">
                  End Date *
                </Label>
                <Input
                  id="edit-offer-end-date"
                  type="date"
                  value={offerFormData.end_date}
                  onChange={(e) => setOfferFormData({ ...offerFormData, end_date: e.target.value })}
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-offer-status" className="font-semibold text-gray-700 dark:text-gray-300">
                Status
              </Label>
              <Select
                value={offerFormData.is_active ? "active" : "inactive"}
                onValueChange={(value) =>
                  setOfferFormData({ ...offerFormData, is_active: value === "active" })
                }
              >
                <SelectTrigger
                  id="edit-offer-status"
                  className="border-2 border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 dark:focus:border-emerald-600"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-emerald-200/50 dark:border-emerald-800/50">
              <Button
                variant="outline"
                onClick={() => setOfferEditDialogOpen(false)}
                className="border-gray-300 dark:border-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveOffer}
                disabled={saving}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/25 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Offer Confirmation Dialog */}
      <Dialog open={deleteOfferConfirmOpen} onOpenChange={setDeleteOfferConfirmOpen}>
        <DialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-2 border-red-200/50 dark:border-red-800/50 shadow-2xl shadow-red-500/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Delete Offer
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete the offer "{offerToDelete?.name}"? This action cannot be undone. Offers with associated products cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOfferConfirmOpen(false);
                setOfferToDelete(null);
              }}
              className="border-gray-300 dark:border-gray-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOffer}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-red-500/25"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

