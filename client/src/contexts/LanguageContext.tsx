import { createContext, useContext, useState, ReactNode } from "react";

type Language = "fr" | "en" | "sw";

const LANGUAGE_STORAGE_KEY = "preferred-language";

// Helper function to get language from localStorage
const getStoredLanguage = (): Language => {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && (stored === "fr" || stored === "en" || stored === "sw")) {
      return stored as Language;
    }
  } catch (error) {
    console.error("Error reading language from localStorage:", error);
  }
  return "fr"; // Default to French
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Navigation
    suppliers: "Fournisseurs",
    products: "Produits",
    categories: "Catégories",
    howItWorks: "Comment ça marche",
    login: "Connexion",
    signup: "S'inscrire",
    dashboard: "Tableau de bord",
    
    // Hero
    heroTitle: "Connectez le Congo aux meilleurs fournisseurs d'Afrique de l'Est",
    heroSubtitle: "Sourcez des produits de qualité directement auprès de fabricants vérifiés du Kenya et de Tanzanie",
    heroWorkflowTitle: "Votre parcours d'achat simplifié",
    heroWorkflowSubtitle: "Du panier à la livraison en 3 étapes simples",
    workflowStep1: "Ajoutez au panier",
    workflowStep2: "Payez en ligne",
    workflowStep3: "Suivi en temps réel",
    verifiedSuppliers: "Fournisseurs Vérifiés",
    getStarted: "Commencer Maintenant",
    exploreSuppliersBtn: "Explorer les Fournisseurs",
    
    // Features
    securePayments: "Paiements sécurisés avec service d'entiercement",
    customsDocs: "Documentation douanière automatisée",
    realtimeTracking: "Suivi logistique en temps réel",
    
    // Stats
    suppliers_count: "Fournisseurs",
    products_count: "Produits",
    satisfaction: "Satisfaction",
    
    // Common
    viewDetails: "Voir Détails",
    requestQuote: "Demander un Devis",
    search: "Rechercher",
    filter: "Filtrer",
    verified: "Vérifié",
    location: "Localisation",
    rating: "Note",
    price: "Prix",
    minimumOrder: "Commande Minimum",
    
    // Admin
    overview: "Aperçu",
    users: "Utilisateurs",
    orders: "Commandes",
    payments: "Paiements",
    analytics: "Analytiques",
    settings: "Paramètres",
    recentOrders: "Commandes Récentes",
    viewAll: "Voir tout",
    totalUsers: "Utilisateurs Totaux",
    activeSuppliers: "Fournisseurs Actifs",
    orders30d: "Commandes (30j)",
    revenue30d: "Revenus (30j)",
    exportData: "Exporter les données",
    platformOverview: "Vue d'ensemble de la plateforme",
    systemAlerts: "Alertes Système",
    topCategories: "Top Catégories",
    topSupplierCountries: "Top Pays Fournisseurs",
    confirmOrder: "Confirmer la commande",
    updateStatus: "Mettre à jour le statut",
    updatePayment: "Mettre à jour le paiement",
    paymentConfirmation: "Confirmation de paiement",
    paymentMessage: "Message de confirmation",
    enterPaymentInfo: "Entrer les informations de paiement",
    save: "Enregistrer",
    cancel: "Annuler",
    pending: "En attente",
    paid: "Payé",
    onTransit: "En transit",
    delivered: "Livré",
    cancelled: "Annulé",
    failed: "Échoué",
    orderNumber: "Numéro de commande",
    customer: "Client",
    amount: "Montant",
    date: "Date",
    status: "Statut",
    paymentStatus: "Statut du paiement",
    
    // E-commerce
    searchProducts: "Rechercher des produits...",
    addToCart: "Ajouter au panier",
    cart: "Panier",
    items: "articles",
    emptyCart: "Votre panier est vide",
    total: "Total",
    proceedToCheckout: "Passer la commande",
    loginToContinue: "Connexion pour continuer",
    loginDescription: "Veuillez vous connecter pour finaliser votre commande",
    email: "Email",
    password: "Mot de passe",
    loginAndCheckout: "Se connecter et commander",
    processing: "Traitement...",
    noAccount: "Vous n'avez pas de compte?",
    orderPlaced: "Commande passée!",
    orderConfirmation: "Votre commande a été passée avec succès. Total:",
    minOrder: "Commande min",
    featured: "En vedette",
    featuredProducts: "Produits en vedette",
    dealsOfTheDay: "Offres du jour",
    addedToCart: "Ajouté au panier",
    addedToCartDesc: "a été ajouté à votre panier",
    description: "Description",
    similarProducts: "Produits similaires",
    backToProducts: "Retour aux produits",
    productNotFound: "Produit non trouvé",
    backToHome: "Retour à l'accueil",
    inStock: "En stock",
    outOfStock: "Rupture de stock",
  },
  en: {
    // Navigation
    suppliers: "Suppliers",
    products: "Products",
    categories: "Categories",
    howItWorks: "How It Works",
    login: "Login",
    signup: "Sign Up",
    dashboard: "Dashboard",
    
    // Hero
    heroTitle: "Connect Congo with East Africa's Best Suppliers",
    heroSubtitle: "Source quality products directly from verified Kenyan & Tanzanian manufacturers",
    heroWorkflowTitle: "Your simplified shopping journey",
    heroWorkflowSubtitle: "From cart to delivery in 3 simple steps",
    workflowStep1: "Add orders to cart",
    workflowStep2: "Pay for your product",
    workflowStep3: "Track deliveries in real time",
    verifiedSuppliers: "Verified Suppliers",
    getStarted: "Get Started Now",
    exploreSuppliersBtn: "Explore Suppliers",
    
    // Features
    securePayments: "Secure payments with escrow service",
    customsDocs: "Automated customs documentation",
    realtimeTracking: "Real-time logistics tracking",
    
    // Stats
    suppliers_count: "Suppliers",
    products_count: "Products",
    satisfaction: "Satisfaction",
    
    // Common
    viewDetails: "View Details",
    requestQuote: "Request Quote",
    search: "Search",
    filter: "Filter",
    verified: "Verified",
    location: "Location",
    rating: "Rating",
    price: "Price",
    minimumOrder: "Minimum Order",
    
    // Admin
    overview: "Overview",
    users: "Users",
    orders: "Orders",
    payments: "Payments",
    analytics: "Analytics",
    settings: "Settings",
    recentOrders: "Recent Orders",
    viewAll: "View All",
    totalUsers: "Total Users",
    activeSuppliers: "Active Suppliers",
    orders30d: "Orders (30d)",
    revenue30d: "Revenue (30d)",
    exportData: "Export Data",
    platformOverview: "Platform Overview",
    systemAlerts: "System Alerts",
    topCategories: "Top Categories",
    topSupplierCountries: "Top Supplier Countries",
    confirmOrder: "Confirm Order",
    updateStatus: "Update Status",
    updatePayment: "Update Payment",
    paymentConfirmation: "Payment Confirmation",
    paymentMessage: "Confirmation Message",
    enterPaymentInfo: "Enter Payment Information",
    save: "Save",
    cancel: "Cancel",
    pending: "Pending",
    paid: "Paid",
    onTransit: "In Transit",
    delivered: "Delivered",
    cancelled: "Cancelled",
    failed: "Failed",
    orderNumber: "Order Number",
    customer: "Customer",
    amount: "Amount",
    date: "Date",
    status: "Status",
    paymentStatus: "Payment Status",
    
    // E-commerce
    searchProducts: "Search for products...",
    addToCart: "Add to Cart",
    cart: "Cart",
    items: "items",
    emptyCart: "Your cart is empty",
    total: "Total",
    proceedToCheckout: "Proceed to Checkout",
    loginToContinue: "Login to Continue",
    loginDescription: "Please login to complete your order",
    email: "Email",
    password: "Password",
    loginAndCheckout: "Login & Checkout",
    processing: "Processing...",
    noAccount: "Don't have an account?",
    orderPlaced: "Order Placed!",
    orderConfirmation: "Your order has been placed successfully. Total:",
    minOrder: "Min Order",
    featured: "Featured",
    featuredProducts: "Featured Products",
    dealsOfTheDay: "Deals of the Day",
    addedToCart: "Added to Cart",
    addedToCartDesc: "has been added to your cart",
    description: "Description",
    similarProducts: "Similar Products",
    backToProducts: "Back to Products",
    productNotFound: "Product not found",
    backToHome: "Back to Home",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
  },
  sw: {
    // Navigation
    suppliers: "Wasambazaji",
    products: "Bidhaa",
    categories: "Jamii",
    howItWorks: "Jinsi Inavyofanya Kazi",
    login: "Ingia",
    signup: "Jisajili",
    dashboard: "Dashibodi",
    
    // Hero
    heroTitle: "Unganisha Congo na Wasambazaji Bora wa Afrika Mashariki",
    heroSubtitle: "Pata bidhaa za ubora moja kwa moja kutoka kwa wazalishaji walioidhinishwa wa Kenya na Tanzania",
    heroWorkflowTitle: "Safari yako ya ununuzi imerahisishwa",
    heroWorkflowSubtitle: "Kutoka kikapu hadi utoaji kwa hatua 3 tu",
    workflowStep1: "Ongeza kwenye kikapu",
    workflowStep2: "Lipa bidhaa yako",
    workflowStep3: "Fuatilia utoaji wakati halisi",
    verifiedSuppliers: "Wasambazaji Walioidhinishwa",
    getStarted: "Anza Sasa",
    exploreSuppliersBtn: "Chunguza Wasambazaji",
    
    // Features
    securePayments: "Malipo salama na huduma ya escrow",
    customsDocs: "Nyaraka za forodha zilizokamilika",
    realtimeTracking: "Ufuatiliaji wa usafirishaji wa wakati halisi",
    
    // Stats
    suppliers_count: "Wasambazaji",
    products_count: "Bidhaa",
    satisfaction: "Kuridhika",
    
    // Common
    viewDetails: "Tazama Maelezo",
    requestQuote: "Omba Bei",
    search: "Tafuta",
    filter: "Chuja",
    verified: "Imeidhinishwa",
    location: "Mahali",
    rating: "Ukadiriaji",
    price: "Bei",
    minimumOrder: "Agizo la Chini",
    
    // Admin
    overview: "Mapitio",
    users: "Watumiaji",
    orders: "Maagizo",
    payments: "Malipo",
    analytics: "Uchanganuzi",
    settings: "Mipangilio",
    recentOrders: "Maagizo ya Hivi Karibuni",
    viewAll: "Tazama Yote",
    totalUsers: "Jumla ya Watumiaji",
    activeSuppliers: "Wasambazaji Wanaofanya Kazi",
    orders30d: "Maagizo (siku 30)",
    revenue30d: "Mapato (siku 30)",
    exportData: "Hamisha Data",
    platformOverview: "Muhtasari wa Jukwaa",
    systemAlerts: "Arifa za Mfumo",
    topCategories: "Jamii za Juu",
    topSupplierCountries: "Nchi za Juu za Wasambazaji",
    confirmOrder: "Thibitisha Agizo",
    updateStatus: "Sasisha Hali",
    updatePayment: "Sasisha Malipo",
    paymentConfirmation: "Uthibitishaji wa Malipo",
    paymentMessage: "Ujumbe wa Uthibitishaji",
    enterPaymentInfo: "Ingiza Taarifa za Malipo",
    save: "Hifadhi",
    cancel: "Ghairi",
    pending: "Inasubiri",
    paid: "Imelipwa",
    onTransit: "Njiani",
    delivered: "Imeletwa",
    cancelled: "Imefutwa",
    failed: "Imeshindwa",
    orderNumber: "Nambari ya Agizo",
    customer: "Mteja",
    amount: "Kiasi",
    date: "Tarehe",
    status: "Hali",
    paymentStatus: "Hali ya Malipo",
    
    // E-commerce
    searchProducts: "Tafuta bidhaa...",
    addToCart: "Ongeza kwenye Kikapu",
    cart: "Kikapu",
    items: "vitu",
    emptyCart: "Kikapu chako ni tupu",
    total: "Jumla",
    proceedToCheckout: "Endelea na Malipo",
    loginToContinue: "Ingia ili Kuendelea",
    loginDescription: "Tafadhali ingia ili kukamilisha agizo lako",
    email: "Barua pepe",
    password: "Nenosiri",
    loginAndCheckout: "Ingia na Malipo",
    processing: "Inachakata...",
    noAccount: "Huna akaunti?",
    orderPlaced: "Agizo Limewekwa!",
    orderConfirmation: "Agizo lako limewekwa kwa mafanikio. Jumla:",
    minOrder: "Agizo la Chini",
    featured: "Zilizoangaziwa",
    featuredProducts: "Bidhaa Zilizoangaziwa",
    dealsOfTheDay: "Ofa za Leo",
    addedToCart: "Imeongezwa kwenye Kikapu",
    addedToCartDesc: "imeongezwa kwenye kikapu chako",
    description: "Maelezo",
    similarProducts: "Bidhaa Zinazofanana",
    backToProducts: "Rudi kwa Bidhaa",
    productNotFound: "Bidhaa haipatikani",
    backToHome: "Rudi Nyumbani",
    inStock: "Ipo Stokini",
    outOfStock: "Imeisha Stokini",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getStoredLanguage);

  // Custom setLanguage that also saves to localStorage
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (error) {
      console.error("Error saving language to localStorage:", error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.fr] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
