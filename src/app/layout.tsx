import './globals.css';

export const metadata = {
  title: 'Alê Ferragens',
  description: 'Ferragens de qualidade para marceneiros',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
