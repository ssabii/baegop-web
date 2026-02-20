import { SearchBar } from "@/components/search-bar";

export default function WithSearchBarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SearchBar />
      <div className="pt-17">{children}</div>
    </>
  );
}
