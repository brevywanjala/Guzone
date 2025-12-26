import { Shield, Truck, FileText, MessageSquare, CreditCard, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Fournisseurs Vérifiés",
    description: "Tous les fournisseurs passent par un processus KYC rigoureux avec badges de vérification.",
  },
  {
    icon: MessageSquare,
    title: "Demandes de Devis (RFQ)",
    description: "Envoyez des demandes de devis et négociez directement avec les fournisseurs.",
  },
  {
    icon: CreditCard,
    title: "Paiements Sécurisés",
    description: "M-Pesa, Airtel Money, Orange Money et service d'entiercement intégré.",
  },
  {
    icon: Truck,
    title: "Suivi Logistique",
    description: "Suivez vos expéditions en temps réel de l'Afrique de l'Est jusqu'à la RDC.",
  },
  {
    icon: FileText,
    title: "Documents Douaniers",
    description: "Téléchargez automatiquement tous les documents en français pour la douane.",
  },
  {
    icon: TrendingUp,
    title: "Analytics & Insights",
    description: "Tableau de bord complet pour gérer commandes, paiements et performances.",
  },
];

export function Features() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Tout ce dont vous avez besoin pour{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              réussir
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Une plateforme complète conçue pour simplifier le commerce transfrontalier B2B
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition-all border-border hover:border-primary/50 group"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
