import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Terms() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 py-16">
          <div className="container text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">{t("termsPageTitle")}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("termsPageSubtitle")}
            </p>
          </div>
        </div>

        {/* Terms Content */}
        <section className="py-16">
          <div className="container max-w-4xl space-y-8">
            <div className="text-sm text-muted-foreground">
              <p>{t("termsLastUpdated")}</p>
            </div>

            {/* Section 1 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{t("termsSection1Title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("termsSection1Text")}
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{t("termsSection2Title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("termsSection2Text")}
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{t("termsSection3Title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("termsSection3Text")}
              </p>
            </div>

            {/* Section 4 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{t("termsSection4Title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("termsSection4Text")}
              </p>
            </div>

            {/* Section 5 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{t("termsSection5Title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("termsSection5Text")}
              </p>
            </div>

            {/* Section 6 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{t("termsSection6Title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("termsSection6Text")}
              </p>
            </div>

            {/* Section 7 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{t("termsSection7Title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("termsSection7Text")}
              </p>
            </div>

            {/* Contact */}
            <div className="space-y-4 pt-8 border-t">
              <h2 className="text-2xl font-bold">{t("termsContactTitle")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("termsContactText")}
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

