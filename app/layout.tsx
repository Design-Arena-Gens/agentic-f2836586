export const metadata = {
  title: "DZD Converter",
  description: "Minimal calculator for DZD and custom currencies",
};

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <a href="/" className="brand">DZD Converter</a>
            <nav className="tabs">
              <a href="/" className="tab">Convert</a>
              <a href="/rates" className="tab">Rates</a>
            </nav>
          </header>
          <main>{children}</main>
          <footer className="footer">
            <span>Offline, no data leaves your browser.</span>
          </footer>
        </div>
      </body>
    </html>
  );
}

