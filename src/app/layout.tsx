import { GoogleAnalytics } from "@next/third-parties/google";
import {
  dehydrate,
  QueryClient,
} from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import AnalyticsTracker from "@/components/analytics-tracker";
import { Toaster } from "@/components/ui/sonner";
import { getServerProfile } from "@/lib/queries/profile";
import { profileKeys } from "@/lib/query-keys";
import Providers from "@/providers";
import type { Metadata } from "next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "배곱",
  description: "배고플땐 배곱",
  openGraph: {
    images: [
      {
        url: "https://aeeznpdtczcyrqbnzxmb.supabase.co/storage/v1/object/public/assets/baegop-og@1x.png",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 프로필을 서버에서 1회 조회해 hydrate → 클라이언트 useProfile의 초기 왕복 제거
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: profileKeys.all,
    queryFn: getServerProfile,
  });
  const dehydratedState = dehydrate(queryClient);

  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers dehydratedState={dehydratedState}>
          {children}
          <Toaster />
          <AnalyticsTracker />
        </Providers>
        <Analytics />
      </body>
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
    </html>
  );
}
