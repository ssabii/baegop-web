import { SubHeader } from "@/components/sub-header";
import { DubaiCookieMap } from "./dubai-cookie-map";

export default function DubaiCookiePage() {
  return (
    <div className="flex h-dvh flex-col">
      <SubHeader title="두쫀쿠 지도" />
      <DubaiCookieMap />
    </div>
  );
}
