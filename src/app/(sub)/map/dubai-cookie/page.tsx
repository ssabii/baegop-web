import { Suspense } from "react";
import { DubaiCookieMap } from "./dubai-cookie-map";

export default function DubaiCookiePage() {
  return (
    <div className="flex h-dvh flex-col">
      <Suspense>
        <DubaiCookieMap />
      </Suspense>
    </div>
  );
}
