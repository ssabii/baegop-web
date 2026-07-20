"use client";

import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
  type DehydratedState,
} from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense, useState } from "react";
import { ConfirmDialogProvider } from "@/components/confirm-dialog-provider";

const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? lazy(() =>
        import("@tanstack/react-query-devtools").then((mod) => ({
          default: mod.ReactQueryDevtools,
        })),
      )
    : () => null;

export default function Providers({
  children,
  dehydratedState,
}: {
  children: React.ReactNode;
  dehydratedState?: DehydratedState;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
        </ThemeProvider>
        <Suspense>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
