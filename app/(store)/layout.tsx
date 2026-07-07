import { LenisProvider } from "@/components/animations/LenisProvider";
import { CartProvider } from "@/lib/hooks/useCart";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { UtilityBar } from "@/components/store/UtilityBar";
import { CartDrawer } from "@/components/store/CartDrawer";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LenisProvider>
      <CartProvider>
        <CartDrawer />
        <div className="flex flex-col min-h-screen bg-branco">
          <div className="fixed top-0 left-0 w-full z-[60]">
            <UtilityBar />
            <StoreHeader />
          </div>
          <div className="pt-28">
            <main className="flex-grow">{children}</main>
            <StoreFooter />
          </div>
        </div>
      </CartProvider>
    </LenisProvider>
  );
}
