import { Inter } from "next/font/google";
import "./globals.css";
import "react-activity-calendar/tooltips.css";
import { Toaster } from 'sonner';
import SmoothScrollWrapper from '@/components/SmoothScrollWrapper';
import { CustomCursor } from '@/components/ui/custom-cursor';

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "Sumit Bhagat | Full-Stack Developer",
  description: "Personal portfolio of Sumit Bhagat, a passionate full-stack developer.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${inter.variable}`}>
        <CustomCursor />
        <SmoothScrollWrapper>
          {children}
        </SmoothScrollWrapper>
        <Toaster 
          position="top-center"
          richColors
          closeButton
          theme="dark"
        />
      </body>
    </html>
  );
}
