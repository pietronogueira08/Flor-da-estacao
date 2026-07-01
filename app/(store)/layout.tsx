import { LenisProvider } from "@/components/animations/LenisProvider";
import { CartProvider } from "@/lib/hooks/useCart";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LenisProvider>
      <CartProvider>
        <div className="flex flex-col min-h-screen bg-marfim pt-20">
          <StoreHeader />
          <main className="flex-grow">{children}</main>
          <StoreFooter />
        </div>
      </CartProvider>
    </LenisProvider>
  );
}
