import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "Sumit Bhagat | Full-Stack Developer",
  description: "Personal portfolio of Sumit Bhagat, a passionate full-stack developer.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
