import { Search, FileText, CreditCard, Package } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Découvrez des Fournisseurs",
    description: "Parcourez notre catalogue de fournisseurs vérifiés du Kenya et de Tanzanie par catégorie de produits.",
  },
  {
    icon: FileText,
    step: "02",
    title: "Demandez des Devis",
    description: "Envoyez des demandes de devis (RFQ), négociez les prix et recevez des bons de commande détaillés.",
  },
  {
    icon: CreditCard,
    step: "03",
    title: "Payez en Toute Sécurité",
    description: "Effectuez des paiements via mobile money ou virement bancaire avec protection par entiercement.",
  },
  {
    icon: Package,
    step: "04",
    title: "Recevez & Suivez",
    description: "Suivez votre expédition en temps réel et téléchargez les documents douaniers en français.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Comment ça marche
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Quatre étapes simples pour commencer à importer depuis l'Afrique de l'Est
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                    <item.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
