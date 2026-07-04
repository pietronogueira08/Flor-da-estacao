import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, origem } = body;

    // Validação server-side
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "E-mail inválido." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verifica duplicata
    const { data: existing } = await supabase
      .from("newsletter_leads")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado." },
        { status: 409 }
      );
    }

    const { error } = await supabase.from("newsletter_leads").insert({
      email: email.toLowerCase().trim(),
      origem: origem || "home",
    });

    if (error) {
      console.error("Newsletter insert error:", error);
      return NextResponse.json(
        { error: "Erro ao salvar. Tente novamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Newsletter route error:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
