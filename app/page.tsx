import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-nevoa flex flex-col items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.svg"
            alt="Flor da Estação"
            width={200}
            height={80}
            className="h-20 w-auto"
          />
        </div>
        <h1 className="font-cormorant text-5xl text-carvao italic">
          Flor da Estação
        </h1>
        <p className="font-jost text-musgo text-lg max-w-md">
          Moda feminina com identidade botânica e romântica. Em breve, nossa loja estará disponível.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/admin/login"
            className="bg-ameixa text-marfim px-6 py-3 font-jost font-medium hover:bg-carvao transition-colors rounded-sm"
          >
            Área Administrativa
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-sm mx-auto">
          {["rosa-antigo", "ameixa", "musgo"].map((color) => (
            <div
              key={color}
              className="h-12 rounded-sm"
              style={{
                backgroundColor:
                  color === "rosa-antigo"
                    ? "#D2A9B1"
                    : color === "ameixa"
                    ? "#7D4F5A"
                    : "#6B7860",
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
