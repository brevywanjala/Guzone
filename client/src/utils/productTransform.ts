import { Product as BackendProduct } from "@/apiRoutes/productsApi";
import { Product as FrontendProduct } from "@/data/mockData";

/**
 * Get the full image URL for a product image
 */
export const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) {
    return '/placeholder-product.jpg';
  }
  
  // If it's already a full URL (http/https) - includes Cloudinary URLs
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a local upload path, construct the full backend URL
  if (imageUrl.startsWith('/api/products/uploads/') || imageUrl.startsWith('/products/uploads/')) {
    let apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    
    // Remove trailing slash if present
    apiBaseUrl = apiBaseUrl.replace(/\/$/, '');
    
    // If the path already starts with /api/products/uploads/
    if (imageUrl.startsWith('/api/products/uploads/')) {
      // apiBaseUrl might already include /api, so we need to handle both cases
      // If apiBaseUrl ends with /api, use it as is, otherwise add /api
      if (apiBaseUrl.endsWith('/api')) {
        // Remove /api from the imageUrl since apiBaseUrl already has it
        const pathWithoutApi = imageUrl.replace('/api', '');
        return `${apiBaseUrl}${pathWithoutApi}`;
      } else {
        // apiBaseUrl doesn't have /api, so use imageUrl as is
        return `${apiBaseUrl}${imageUrl}`;
      }
    }
    
    // If it starts with /products/uploads/, prepend /api
    if (imageUrl.startsWith('/products/uploads/')) {
      if (apiBaseUrl.endsWith('/api')) {
        return `${apiBaseUrl}${imageUrl}`;
      } else {
        return `${apiBaseUrl}/api${imageUrl}`;
      }
    }
  }
  
  // If it starts with /, assume it's a relative path from the public folder
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }
  
  // Otherwise, return as is (might be a relative path)
  return imageUrl;
};

/**
 * Transform backend Product format to frontend ProductCard format
 */
export const transformProduct = (backendProduct: BackendProduct): FrontendProduct => {
  // Get main image URL, fallback to first image if no main_image_url
  const mainImage = backendProduct.main_image_url || 
    (backendProduct.images && backendProduct.images.length > 0 ? backendProduct.images[0].image_url : null);
  
  // Get all image URLs
  const allImages = backendProduct.images?.map(img => img.image_url) || [];
  if (backendProduct.main_image_url && !allImages.includes(backendProduct.main_image_url)) {
    allImages.unshift(backendProduct.main_image_url);
  }
  
  // Extract price directly from backend - backend ALWAYS returns price as float
  // Backend returns: price (float, always present), discounted_price (float or null)
  const regularPrice: number = typeof backendProduct.price === 'number' 
    ? backendProduct.price 
    : parseFloat(String(backendProduct.price || 0));
  
  // Extract discount percentage
  const discountPercentage = backendProduct.discount_percentage !== null && backendProduct.discount_percentage !== undefined
    ? (typeof backendProduct.discount_percentage === 'number'
        ? backendProduct.discount_percentage
        : parseFloat(String(backendProduct.discount_percentage)))
    : null;
  
  // Check if we should apply discount
  // Either backend calculated discounted_price, OR we have discount_percentage and should calculate it
  let discountedPrice: number | null = null;
  let hasActiveDiscount = false;
  
  // First, use backend's calculated discounted_price if it exists
  if (backendProduct.discounted_price !== null && backendProduct.discounted_price !== undefined) {
    discountedPrice = typeof backendProduct.discounted_price === 'number' 
      ? backendProduct.discounted_price 
      : parseFloat(String(backendProduct.discounted_price));
    hasActiveDiscount = true;
  } 
  // If backend didn't calculate it but we have discount_percentage, calculate it client-side
  else if (discountPercentage !== null && discountPercentage > 0 && regularPrice > 0) {
    // Check date range - prefer product dates, fallback to offer dates
    let shouldApplyDiscount = true;
    const now = new Date();
    
    // Check product discount dates first
    if (backendProduct.discount_start_date && backendProduct.discount_end_date) {
      const startDate = new Date(backendProduct.discount_start_date);
      const endDate = new Date(backendProduct.discount_end_date);
      shouldApplyDiscount = now >= startDate && now <= endDate;
    }
    // If product dates are null, check offer dates
    else if (backendProduct.offer && backendProduct.offer.start_date && backendProduct.offer.end_date) {
      const startDate = new Date(backendProduct.offer.start_date);
      const endDate = new Date(backendProduct.offer.end_date);
      shouldApplyDiscount = now >= startDate && now <= endDate;
    }
    // If no dates at all, apply discount if percentage exists
    // (This handles cases where discount_percentage is set but dates are null)
    
    if (shouldApplyDiscount) {
      const discountAmount = regularPrice * (discountPercentage / 100);
      discountedPrice = Math.round((regularPrice - discountAmount) * 100) / 100; // Round to 2 decimals
      hasActiveDiscount = true;
    }
  }
  
  // Display logic:
  // - If discount active: show discounted_price as main price, regular price as crossed out
  // - If no discount: show regular price only
  const displayPrice = hasActiveDiscount && discountedPrice !== null
    ? discountedPrice
    : regularPrice;
  
  // Discount percentage for badge display (show if we have an active discount)
  const discount = hasActiveDiscount && discountPercentage !== null
    ? discountPercentage
    : undefined;
  
  // Original price (crossed out) - only shown when discount is active
  const originalPrice = hasActiveDiscount && discountedPrice !== null
    ? regularPrice
    : undefined;
  
  return {
    id: String(backendProduct.id),
    name: backendProduct.name,
    category: backendProduct.category?.name || 'Uncategorized',
    supplier: backendProduct.supplier_name || 'Unknown Supplier',
    supplierId: String(backendProduct.id), // Using product id as supplier id for now
    country: 'Kenya' as const, // Default to Kenya, can be updated if we add country field
    price: displayPrice,
    currency: 'USD' as const, // Default to USD
    minOrder: backendProduct.minimum_order || 1,
    unit: backendProduct.unit_term || 'units',
    image: getImageUrl(mainImage),
    images: allImages.length > 0 ? allImages.map(getImageUrl) : undefined,
    description: backendProduct.description || undefined,
    verified: true, // Default to verified
    inStock: backendProduct.stock_quantity > 0,
    discount: discount,
    featured: backendProduct.is_featured,
    originalPrice: originalPrice,
  };
};

