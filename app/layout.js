import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });


export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-gray-100 text-black">
        
        <header className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between">
            <a href="/products" className="font-semibold text-lg">
              StockGuard
            </a>

            <div className="flex justify-end gap-4">



            <a
              href="/products"
              className="text-sm text-gray-600 hover:underline"
              >
              Products
            </a>

             <a
              href="/allwarehouse"
              className="text-sm text-gray-600 hover:underline"
              >
              Warehouse
            </a>
           
              </div>
          </div>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}