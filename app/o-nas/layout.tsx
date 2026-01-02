import { Metadata } from "next";

export const metadata: Metadata = {
  title: "O nas | HomeScreen",
  description: "Poznaj HomeScreen - Twój sklep z akcesoriami do telefonów. Dowiedz się więcej o naszej historii, misji i wartościach.",
};

export default function ONasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
