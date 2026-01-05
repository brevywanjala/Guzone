import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Package, Globe, Truck, Shield, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 py-16">
          <div className="container text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">{t("aboutPageTitle")}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("aboutPageSubtitle")}
            </p>
          </div>
        </div>

        {/* About Content */}
        <section className="py-16">
          <div className="container max-w-4xl space-y-12">
            {/* Mission */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">{t("aboutMissionTitle")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("aboutMissionText")}
              </p>
            </div>

            {/* What We Do */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">{t("aboutWhatWeDoTitle")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("aboutWhatWeDoText")}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">{t("aboutFeaturesTitle")}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{t("aboutFeature1Title")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("aboutFeature1Text")}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Truck className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{t("aboutFeature2Title")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("aboutFeature2Text")}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{t("aboutFeature3Title")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("aboutFeature3Text")}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{t("aboutFeature4Title")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("aboutFeature4Text")}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4 pt-8 border-t">
              <h2 className="text-3xl font-bold">{t("aboutContactTitle")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("aboutContactText")}
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong>{t("phone")}:</strong>{" "}
                  <a href="tel:+254710168286" className="text-primary hover:underline">
                    +254710168286
                  </a>
                </p>
                <p>
                  <strong>{t("email")}:</strong>{" "}
                  <a href="mailto:info@guzones.com" className="text-primary hover:underline">
                    info@guzones.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

