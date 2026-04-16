import { type Metadata } from "next";
import { FortuneCapsulePage } from "./fortune-capsule-page";

export const metadata: Metadata = {
  title: "배곱 캡슐 | 배곱",
};

export default function FortunePage() {
  return <FortuneCapsulePage />;
}
