const PROVINCE_SHORT: Record<string, string> = {
  서울특별시: "서울",
  부산광역시: "부산",
  대구광역시: "대구",
  인천광역시: "인천",
  광주광역시: "광주",
  대전광역시: "대전",
  울산광역시: "울산",
  세종특별자치시: "세종",
  경기도: "경기",
  강원특별자치도: "강원",
  충청북도: "충북",
  충청남도: "충남",
  전북특별자치도: "전북",
  전라남도: "전남",
  경상북도: "경북",
  경상남도: "경남",
  제주특별자치도: "제주",
};

/**
 * 주소를 축약 형태로 포맷팅한다.
 * - 시/도를 약어로 변환 (서울특별시→서울, 경기도→경기)
 * - 마지막 번지/건물번호를 제거
 *
 * "경기도 성남시 분당구 불정로 6" → "경기 성남시 분당구 불정로"
 * "서울특별시 중구 세종대로 110" → "서울 중구 세종대로"
 */
export function formatShortAddress(address: string): string {
  if (!address) return "";
  const parts = address.split(" ");

  if (parts[0] && PROVINCE_SHORT[parts[0]]) {
    parts[0] = PROVINCE_SHORT[parts[0]];
  }

  const last = parts[parts.length - 1];
  if (parts.length > 2 && /^\d/.test(last)) {
    parts.pop();
  }

  return parts.join(" ");
}
