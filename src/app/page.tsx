import { Storefront } from "@/components/Storefront";
import { LanguageProvider } from "@/context/LanguageContext";

export default function Home() {
  return (
    <LanguageProvider>
      <Storefront />
    </LanguageProvider>
  );
}
