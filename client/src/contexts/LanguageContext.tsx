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
    
    // Footer
    footerDescription: "Connecter l'Afrique Centrale et l'Afrique de l'Est à travers le commerce B2B.",
    footerProducts: "Produits",
    footerCompany: "Entreprise",
    footerContact: "Contact",
    about: "À propos",
    terms: "Conditions",
    privacy: "Confidentialité",
    footerCopyright: "© 2025 Guzone. Tous droits réservés.",
    
    // About Page
    aboutPageTitle: "À Propos de Guzone",
    aboutPageSubtitle: "Votre plateforme de confiance pour le commerce transfrontalier B2B",
    aboutMissionTitle: "Notre Mission",
    aboutMissionText: "Guzone est une place de marché en ligne qui connecte les acheteurs en République Démocratique du Congo, au Kenya et en Tanzanie aux vendeurs, en garantissant la livraison de leurs produits. Notre mission est de faciliter le commerce transfrontalier en Afrique en créant une plateforme sécurisée et efficace qui permet aux entreprises de se connecter, d'échanger et de grandir ensemble.",
    aboutWhatWeDoTitle: "Ce Que Nous Faisons",
    aboutWhatWeDoText: "Guzone sert de pont entre les acheteurs et les vendeurs à travers l'Afrique centrale et orientale. Nous facilitons les transactions B2B en offrant une plateforme où les entreprises peuvent découvrir des produits, passer des commandes et suivre leurs livraisons en temps réel. Notre système garantit que tous les produits commandés sont livrés de manière sécurisée et efficace.",
    aboutFeaturesTitle: "Pourquoi Choisir Guzone",
    aboutFeature1Title: "Connexion Transfrontalière",
    aboutFeature1Text: "Connectez-vous facilement avec des vendeurs et des acheteurs en RDC, au Kenya et en Tanzanie.",
    aboutFeature2Title: "Livraison Garantie",
    aboutFeature2Text: "Nous nous assurons que tous les produits commandés sont livrés en toute sécurité à destination.",
    aboutFeature3Title: "Plateforme Sécurisée",
    aboutFeature3Text: "Transactions sécurisées avec protection des paiements et suivi en temps réel.",
    aboutFeature4Title: "Support Client",
    aboutFeature4Text: "Notre équipe est disponible pour vous aider à chaque étape de votre parcours d'achat.",
    aboutContactTitle: "Contactez-Nous",
    aboutContactText: "Pour toute question ou assistance, n'hésitez pas à nous contacter:",
    phone: "Téléphone",
    
    // Terms Page
    termsPageTitle: "Conditions d'Utilisation",
    termsPageSubtitle: "Veuillez lire attentivement nos conditions d'utilisation",
    termsLastUpdated: "Dernière mise à jour: Janvier 2025",
    termsSection1Title: "1. Acceptation des Conditions",
    termsSection1Text: "En accédant et en utilisant Guzone, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.",
    termsSection2Title: "2. Description du Service",
    termsSection2Text: "Guzone est une place de marché en ligne qui connecte les acheteurs en RDC, au Kenya et en Tanzanie aux vendeurs. Nous facilitons les transactions B2B et garantissons la livraison des produits commandés.",
    termsSection3Title: "3. Compte Utilisateur",
    termsSection3Text: "Pour utiliser nos services, vous devez créer un compte. Vous êtes responsable de maintenir la confidentialité de vos identifiants et de toutes les activités qui se produisent sous votre compte.",
    termsSection4Title: "4. Commandes et Paiements",
    termsSection4Text: "Toutes les commandes passées sur Guzone sont soumises à acceptation. Les prix sont indiqués en devise locale et peuvent être modifiés sans préavis. Les paiements sont sécurisés via notre système de paiement intégré.",
    termsSection5Title: "5. Livraison",
    termsSection5Text: "Guzone s'engage à garantir la livraison de tous les produits commandés. Les délais de livraison peuvent varier selon la destination. Nous fournissons un suivi en temps réel pour toutes les expéditions.",
    termsSection6Title: "6. Limitation de Responsabilité",
    termsSection6Text: "Guzone agit en tant qu'intermédiaire entre les acheteurs et les vendeurs. Nous ne sommes pas responsables des produits vendus par les vendeurs tiers, mais nous nous efforçons de garantir la qualité et la livraison.",
    termsSection7Title: "7. Modifications des Conditions",
    termsSection7Text: "Guzone se réserve le droit de modifier ces conditions à tout moment. Les modifications prendront effet dès leur publication sur la plateforme.",
    termsContactTitle: "Questions",
    termsContactText: "Si vous avez des questions concernant ces conditions, contactez-nous:",
    
    // Privacy Page
    privacyPageTitle: "Politique de Confidentialité",
    privacyPageSubtitle: "Comment nous collectons, utilisons et protégeons vos informations",
    privacyLastUpdated: "Dernière mise à jour: Janvier 2025",
    privacySection1Title: "1. Informations que Nous Collectons",
    privacySection1Text: "Nous collectons les informations que vous nous fournissez lors de la création de votre compte, de la passation de commandes et de l'utilisation de nos services. Cela inclut votre nom, adresse e-mail, numéro de téléphone, adresse de livraison et informations de paiement.",
    privacySection2Title: "2. Utilisation des Informations",
    privacySection2Text: "Nous utilisons vos informations pour traiter vos commandes, faciliter les transactions, communiquer avec vous concernant vos commandes, améliorer nos services et vous envoyer des mises à jour importantes.",
    privacySection3Title: "3. Partage des Informations",
    privacySection3Text: "Nous ne vendons pas vos informations personnelles. Nous partageons uniquement les informations nécessaires avec les vendeurs pour traiter vos commandes et garantir la livraison. Nous pouvons également partager des informations si la loi l'exige.",
    privacySection4Title: "4. Sécurité des Données",
    privacySection4Text: "Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations personnelles contre l'accès non autorisé, la modification, la divulgation ou la destruction.",
    privacySection5Title: "5. Cookies et Technologies Similaires",
    privacySection5Text: "Nous utilisons des cookies et des technologies similaires pour améliorer votre expérience, analyser l'utilisation de notre plateforme et personnaliser le contenu.",
    privacySection6Title: "6. Vos Droits",
    privacySection6Text: "Vous avez le droit d'accéder, de corriger ou de supprimer vos informations personnelles à tout moment. Vous pouvez également vous désinscrire des communications marketing.",
    privacySection7Title: "7. Modifications de la Politique",
    privacySection7Text: "Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Nous vous informerons de tout changement significatif en publiant la nouvelle politique sur cette page.",
    privacyContactTitle: "Contact",
    privacyContactText: "Pour toute question concernant cette politique de confidentialité, contactez-nous:",
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
    
    // Footer
    footerDescription: "Connecting Central Africa and East Africa through B2B commerce.",
    footerProducts: "Products",
    footerCompany: "Company",
    footerContact: "Contact",
    about: "About",
    terms: "Terms",
    privacy: "Privacy",
    footerCopyright: "© 2025 Guzone. All rights reserved.",
    
    // About Page
    aboutPageTitle: "About Guzone",
    aboutPageSubtitle: "Your trusted platform for cross-border B2B commerce",
    aboutMissionTitle: "Our Mission",
    aboutMissionText: "Guzone is an online marketplace that connects buyers in the Democratic Republic of Congo, Kenya, and Tanzania to sellers, ensuring their products are delivered. Our mission is to facilitate cross-border trade in Africa by creating a secure and efficient platform that enables businesses to connect, trade, and grow together.",
    aboutWhatWeDoTitle: "What We Do",
    aboutWhatWeDoText: "Guzone serves as a bridge between buyers and sellers across Central and East Africa. We facilitate B2B transactions by providing a platform where businesses can discover products, place orders, and track their deliveries in real-time. Our system ensures that all ordered products are delivered securely and efficiently.",
    aboutFeaturesTitle: "Why Choose Guzone",
    aboutFeature1Title: "Cross-Border Connection",
    aboutFeature1Text: "Easily connect with sellers and buyers in DRC, Kenya, and Tanzania.",
    aboutFeature2Title: "Guaranteed Delivery",
    aboutFeature2Text: "We ensure that all ordered products are delivered safely to their destination.",
    aboutFeature3Title: "Secure Platform",
    aboutFeature3Text: "Secure transactions with payment protection and real-time tracking.",
    aboutFeature4Title: "Customer Support",
    aboutFeature4Text: "Our team is available to assist you at every step of your purchasing journey.",
    aboutContactTitle: "Contact Us",
    aboutContactText: "For any questions or assistance, please feel free to contact us:",
    phone: "Phone",
    
    // Terms Page
    termsPageTitle: "Terms of Service",
    termsPageSubtitle: "Please read our terms of service carefully",
    termsLastUpdated: "Last updated: January 2025",
    termsSection1Title: "1. Acceptance of Terms",
    termsSection1Text: "By accessing and using Guzone, you agree to be bound by these terms of service. If you do not agree to these terms, please do not use our platform.",
    termsSection2Title: "2. Service Description",
    termsSection2Text: "Guzone is an online marketplace that connects buyers in DRC, Kenya, and Tanzania to sellers. We facilitate B2B transactions and ensure delivery of ordered products.",
    termsSection3Title: "3. User Account",
    termsSection3Text: "To use our services, you must create an account. You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.",
    termsSection4Title: "4. Orders and Payments",
    termsSection4Text: "All orders placed on Guzone are subject to acceptance. Prices are displayed in local currency and may be changed without notice. Payments are secured through our integrated payment system.",
    termsSection5Title: "5. Delivery",
    termsSection5Text: "Guzone is committed to ensuring delivery of all ordered products. Delivery times may vary depending on the destination. We provide real-time tracking for all shipments.",
    termsSection6Title: "6. Limitation of Liability",
    termsSection6Text: "Guzone acts as an intermediary between buyers and sellers. We are not responsible for products sold by third-party sellers, but we strive to ensure quality and delivery.",
    termsSection7Title: "7. Changes to Terms",
    termsSection7Text: "Guzone reserves the right to modify these terms at any time. Changes will take effect immediately upon posting on the platform.",
    termsContactTitle: "Questions",
    termsContactText: "If you have any questions regarding these terms, please contact us:",
    
    // Privacy Page
    privacyPageTitle: "Privacy Policy",
    privacyPageSubtitle: "How we collect, use, and protect your information",
    privacyLastUpdated: "Last updated: January 2025",
    privacySection1Title: "1. Information We Collect",
    privacySection1Text: "We collect information you provide to us when creating your account, placing orders, and using our services. This includes your name, email address, phone number, delivery address, and payment information.",
    privacySection2Title: "2. Use of Information",
    privacySection2Text: "We use your information to process your orders, facilitate transactions, communicate with you regarding your orders, improve our services, and send you important updates.",
    privacySection3Title: "3. Sharing of Information",
    privacySection3Text: "We do not sell your personal information. We only share necessary information with sellers to process your orders and ensure delivery. We may also share information if required by law.",
    privacySection4Title: "4. Data Security",
    privacySection4Text: "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
    privacySection5Title: "5. Cookies and Similar Technologies",
    privacySection5Text: "We use cookies and similar technologies to enhance your experience, analyze platform usage, and personalize content.",
    privacySection6Title: "6. Your Rights",
    privacySection6Text: "You have the right to access, correct, or delete your personal information at any time. You may also opt-out of marketing communications.",
    privacySection7Title: "7. Changes to Policy",
    privacySection7Text: "We may update this privacy policy from time to time. We will notify you of any significant changes by posting the new policy on this page.",
    privacyContactTitle: "Contact",
    privacyContactText: "For any questions regarding this privacy policy, please contact us:",
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
    
    // Footer
    footerDescription: "Kuunganisha Afrika ya Kati na Afrika Mashariki kupitia biashara ya B2B.",
    footerProducts: "Bidhaa",
    footerCompany: "Kampuni",
    footerContact: "Wasiliana",
    about: "Kuhusu",
    terms: "Masharti",
    privacy: "Faragha",
    footerCopyright: "© 2025 Guzone. Haki zote zimehifadhiwa.",
    
    // About Page
    aboutPageTitle: "Kuhusu Guzone",
    aboutPageSubtitle: "Jukwaa lako la kuaminika la biashara ya B2B ya kuvuka mipaka",
    aboutMissionTitle: "Lengo Letu",
    aboutMissionText: "Guzone ni soko la mtandaoni linalounganisha wanunuzi nchini Jamhuri ya Kidemokrasia ya Kongo, Kenya na Tanzania na wauzaji, kuhakikisha kuwa bidhaa zao zinafika salama. Lengo letu ni kuwezesha biashara ya kuvuka mipaka barani Afrika kwa kuunda jukwaa salama na lenye ufanisi ambalo linawezesha biashara kuungana, kufanya biashara, na kukua pamoja.",
    aboutWhatWeDoTitle: "Tunachofanya",
    aboutWhatWeDoText: "Guzone hutumika kama daraja kati ya wanunuzi na wauzaji katika Afrika ya Kati na Mashariki. Tunawezesha miamala ya B2B kwa kutoa jukwaa ambapo biashara zinaweza kugundua bidhaa, kuweka maagizo, na kufuatilia uwasilishaji wao kwa wakati halisi. Mfumo wetu unahakikisha kuwa bidhaa zote zilizoagizwa zinafika kwa usalama na ufanisi.",
    aboutFeaturesTitle: "Kwa Nini Chagua Guzone",
    aboutFeature1Title: "Uunganisho wa Kuvuka Mipaka",
    aboutFeature1Text: "Ungana kwa urahisi na wauzaji na wanunuzi nchini DRC, Kenya na Tanzania.",
    aboutFeature2Title: "Uwasilishaji Unaohakikishwa",
    aboutFeature2Text: "Tunahakikisha kuwa bidhaa zote zilizoagizwa zinafika kwa usalama kwenye marudio yao.",
    aboutFeature3Title: "Jukwaa Salama",
    aboutFeature3Text: "Miamala salama na ulinzi wa malipo na ufuatiliaji wa wakati halisi.",
    aboutFeature4Title: "Msaada wa Wateja",
    aboutFeature4Text: "Timu yetu ipo ili kukusaidia katika kila hatua ya safari yako ya ununuzi.",
    aboutContactTitle: "Wasiliana Nasi",
    aboutContactText: "Kwa maswali yoyote au msaada, tafadhali jisikie huru kuwasiliana nasi:",
    phone: "Simu",
    
    // Terms Page
    termsPageTitle: "Masharti ya Huduma",
    termsPageSubtitle: "Tafadhali soma masharti yetu ya huduma kwa makini",
    termsLastUpdated: "Sasisho la mwisho: Januari 2025",
    termsSection1Title: "1. Kukubali Masharti",
    termsSection1Text: "Kwa kufikia na kutumia Guzone, unakubali kufungwa na masharti haya ya huduma. Ikiwa hukubali masharti haya, tafadhali usitumie jukwaa letu.",
    termsSection2Title: "2. Maelezo ya Huduma",
    termsSection2Text: "Guzone ni soko la mtandaoni linalounganisha wanunuzi nchini DRC, Kenya na Tanzania na wauzaji. Tunawezesha miamala ya B2B na kuhakikisha uwasilishaji wa bidhaa zilizoagizwa.",
    termsSection3Title: "3. Akaunti ya Mtumiaji",
    termsSection3Text: "Ili kutumia huduma zetu, lazima uunde akaunti. Unawajibika kudumisha siri ya vitambulisho vyako na shughuli zote zinazotokea chini ya akaunti yako.",
    termsSection4Title: "4. Maagizo na Malipo",
    termsSection4Text: "Maagizo yote yaliyowekwa kwenye Guzone yanategemea kukubaliwa. Bei zinaonyeshwa kwa sarafu ya ndani na zinaweza kubadilishwa bila arifa. Malipo yanalindwa kupitia mfumo wetu wa malipo uliojumuishwa.",
    termsSection5Title: "5. Uwasilishaji",
    termsSection5Text: "Guzone imejitolea kuhakikisha uwasilishaji wa bidhaa zote zilizoagizwa. Muda wa uwasilishaji unaweza kutofautiana kulingana na marudio. Tunatoa ufuatiliaji wa wakati halisi kwa mizigo yote.",
    termsSection6Title: "6. Kikomo cha Wajibu",
    termsSection6Text: "Guzone hufanya kazi kama mpatanishi kati ya wanunuzi na wauzaji. Hatuna jukumu la bidhaa zinazouzwa na wauzaji wa watu wa tatu, lakini tunajitahidi kuhakikisha ubora na uwasilishaji.",
    termsSection7Title: "7. Mabadiliko ya Masharti",
    termsSection7Text: "Guzone inahifadhi haki ya kubadilisha masharti haya wakati wowote. Mabadiliko yatakuwa na athari mara moja baada ya kuchapishwa kwenye jukwaa.",
    termsContactTitle: "Maswali",
    termsContactText: "Ikiwa una maswali yoyote kuhusu masharti haya, tafadhali wasiliana nasi:",
    
    // Privacy Page
    privacyPageTitle: "Sera ya Faragha",
    privacyPageSubtitle: "Jinsi tunavyokusanya, kutumia, na kulinda taarifa zako",
    privacyLastUpdated: "Sasisho la mwisho: Januari 2025",
    privacySection1Title: "1. Taarifa Tunazokusanya",
    privacySection1Text: "Tunakusanya taarifa unazotupa unapounda akaunti yako, kuweka maagizo, na kutumia huduma zetu. Hii inajumuisha jina lako, anwani ya barua pepe, nambari ya simu, anwani ya uwasilishaji, na taarifa za malipo.",
    privacySection2Title: "2. Matumizi ya Taarifa",
    privacySection2Text: "Tunatumia taarifa zako ili kusindika maagizo yako, kuwezesha miamala, kuwasiliana nawe kuhusu maagizo yako, kuboresha huduma zetu, na kukutuma sasisho muhimu.",
    privacySection3Title: "3. Kushiriki Taarifa",
    privacySection3Text: "Hatauzi taarifa zako za kibinafsi. Tunashiriki tu taarifa muhimu na wauzaji ili kusindika maagizo yako na kuhakikisha uwasilishaji. Tunaweza pia kushiriki taarifa ikiwa sheria inahitaji.",
    privacySection4Title: "4. Usalama wa Data",
    privacySection4Text: "Tunatekeleza hatua za usalama zinazofaa ili kulinda taarifa zako za kibinafsi dhidi ya ufikiaji usioidhinishwa, mabadiliko, ufichuzi, au uharibifu.",
    privacySection5Title: "5. Vidakuzi na Teknolojia Zinazofanana",
    privacySection5Text: "Tunatumia vidakuzi na teknolojia zinazofanana ili kuboresha uzoefu wako, kuchambua matumizi ya jukwaa letu, na kubinafsisha maudhui.",
    privacySection6Title: "6. Haki Zako",
    privacySection6Text: "Una haki ya kufikia, kusahihisha, au kufuta taarifa zako za kibinafsi wakati wowote. Unaweza pia kujiondoa kutoka kwa mawasiliano ya masoko.",
    privacySection7Title: "7. Mabadiliko ya Sera",
    privacySection7Text: "Tunaweza kusasisha sera hii ya faragha mara kwa mara. Tutakujulisha mabadiliko yoyote muhimu kwa kuchapisha sera mpya kwenye ukurasa huu.",
    privacyContactTitle: "Wasiliana",
    privacyContactText: "Kwa maswali yoyote kuhusu sera hii ya faragha, tafadhali wasiliana nasi:",
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
