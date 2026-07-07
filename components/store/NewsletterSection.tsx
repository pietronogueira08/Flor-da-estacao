"use client";

import { useState } from "react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validação client-side
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Por favor, insira um e-mail válido.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, origem: "home" }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Algo deu errado. Tente novamente.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Erro de conexão. Tente novamente.");
      setStatus("error");
    }
  };

  return (
    <section className="bg-preto py-20 px-4 md:px-8">
      <div className="container mx-auto max-w-2xl text-center">
        <p className="font-archivo text-claro text-xs tracking-widest uppercase mb-4">
          Faça parte
        </p>
        {/* [RASCUNHO — revisar antes de publicar] */}
        <h2 className="font-bodoni text-4xl md:text-5xl text-branco italic leading-tight mb-3">
          Ganhe 10% na sua primeira compra
        </h2>
        <p className="font-archivo text-branco/70 text-sm mb-8">
          Assine nossa newsletter e receba novidades, editoriais exclusivos e ofertas especiais.
        </p>

        {status === "success" ? (
          <div className="bg-branco/10 border border-branco/30 rounded-sm px-6 py-4 text-branco font-archivo text-sm">
            ✦ Bem-vinda à Zaya. Seu cupom de 10% chegará em breve no seu e-mail.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <label htmlFor="newsletter-email" className="sr-only">
              Seu endereço de e-mail
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="flex-1 bg-branco/10 border border-branco/30 text-branco placeholder-branco/50 font-archivo text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-branco/70 focus-visible:ring-2 focus-visible:ring-branco/50 transition-colors"
              aria-describedby={errorMsg ? "newsletter-error" : undefined}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-branco text-dourado font-archivo text-sm uppercase tracking-widest px-6 py-3 rounded-sm hover:bg-claro hover:text-preto transition-colors duration-300 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-branco"
            >
              {status === "loading" ? "Enviando..." : "Quero meu desconto"}
            </button>
          </form>
        )}

        {errorMsg && (
          <p id="newsletter-error" role="alert" className="mt-3 text-claro font-archivo text-xs">
            {errorMsg}
          </p>
        )}
      </div>
    </section>
  );
}
