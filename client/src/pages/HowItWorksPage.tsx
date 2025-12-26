import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HowItWorks } from "@/components/HowItWorks";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 py-16">
          <div className="container text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Comment ça marche</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez comment Guzone simplifie le commerce transfrontalier B2B
            </p>
          </div>
        </div>

        <HowItWorks />

        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold">Pourquoi Guzone?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                La plateforme de confiance pour le commerce transfrontalier
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Fournisseurs Vérifiés",
                  description: "Tous nos partenaires passent par un processus de vérification KYC rigoureux",
                },
                {
                  title: "Protection des Paiements",
                  description: "Service d'entiercement intégré pour sécuriser vos transactions",
                },
                {
                  title: "Support Multilingue",
                  description: "Interface en français, anglais et swahili pour faciliter la communication",
                },
                {
                  title: "Documentation Automatisée",
                  description: "Génération automatique de tous les documents douaniers nécessaires",
                },
                {
                  title: "Suivi en Temps Réel",
                  description: "Suivez vos expéditions du départ jusqu'à la livraison",
                },
                {
                  title: "Support Client 24/7",
                  description: "Notre équipe est disponible pour vous aider à tout moment",
                },
              ].map((benefit, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                    <div className="space-y-2">
                      <h3 className="font-semibold">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
