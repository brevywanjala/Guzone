import apiClient from "./axiosConfig";
import { Offer } from "./productsApi";

export interface CreateOfferData {
  name: string;
  description?: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  is_active?: boolean;
}

export interface UpdateOfferData extends Partial<CreateOfferData> {}

export const offersApi = {
  // Get all offers
  getOffers: async (): Promise<Offer[]> => {
    const response = await apiClient.get<Offer[]>("/products/offers");
    return response.data;
  },

  // Get offer by ID
  getOffer: async (id: number): Promise<Offer> => {
    const response = await apiClient.get<Offer>(`/products/offers/${id}`);
    return response.data;
  },

  // Create offer (admin only)
  createOffer: async (data: CreateOfferData): Promise<Offer> => {
    const response = await apiClient.post<{ message: string; offer: Offer } | Offer>("/products/offers", data);
    // Backend returns {message, offer} or just offer - extract the offer
    const responseData = response.data;
    if ('offer' in responseData && responseData.offer) {
      return responseData.offer;
    }
    return responseData as Offer;
  },

  // Update offer (admin only)
  updateOffer: async (id: number, data: UpdateOfferData): Promise<Offer> => {
    const response = await apiClient.put<{ message: string; offer: Offer } | Offer>(`/products/offers/${id}`, data);
    // Backend returns {message, offer} or just offer - extract the offer
    const responseData = response.data;
    if ('offer' in responseData && responseData.offer) {
      return responseData.offer;
    }
    return responseData as Offer;
  },

  // Delete offer (admin only)
  deleteOffer: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/offers/${id}`);
  },
};

