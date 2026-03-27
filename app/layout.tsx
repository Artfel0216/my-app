import type { Metadata } from "next";
import { Dancing_Script, Poppins } from "next/font/google";
import "./globals.css";

// 1. Configurando a fonte do Título
const fontTitle = Dancing_Script({ 
  subsets: ["latin"],
  variable: "--font-title", // Aqui está a variável que o Tailwind procura!
});

// 2. Configurando a fonte do Corpo (textos)
const fontBody = Poppins({ 
  weight: ["300", "400", "600"], // Pesos da fonte: leve, normal, negrito
  subsets: ["latin"],
  variable: "--font-body", // A outra variável que o Tailwind procura
});

export const metadata: Metadata = {
  title: "Feliz Aniversário, Lauana!",
  description: "Uma surpresa especial para o seu grande dia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      {/* 3. Injetando as variáveis no body da página */}
      <body className={`${fontTitle.variable} ${fontBody.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}