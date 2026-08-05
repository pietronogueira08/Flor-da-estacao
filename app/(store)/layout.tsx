import { LenisProvider } from "@/components/animations/LenisProvider";
import { CartProvider } from "@/lib/hooks/useCart";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { UtilityBar } from "@/components/store/UtilityBar";
import { CartDrawer } from "@/components/store/CartDrawer";
import { WhatsAppFloatingButton } from "@/components/store/WhatsAppFloatingButton";
import { createClient } from "@/lib/supabase/server";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("store_settings").select("*").eq("id", 1).single();

  return (
    <LenisProvider>
      <CartProvider>
        <CartDrawer />
        <div className="flex flex-col min-h-screen bg-branco" style={{ background: '#FAFAFA', color: '#1A1A1A' }}>
          <div className="fixed top-0 left-0 w-full z-[60]">
            <UtilityBar texts={settings?.utility_bar_texts} />
            <StoreHeader />
          </div>
          <div className="pt-28">
            <main className="flex-grow">{children}</main>
            <StoreFooter contact={{
              whatsapp: settings?.contact_whatsapp,
              email: settings?.contact_email,
              address: settings?.contact_address
            }} />
          </div>
          <WhatsAppFloatingButton />
        </div>
      </CartProvider>
    </LenisProvider>
  );
}
