import { SearchBar } from "@/components/search-bar";

export default function WithSearchBarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SearchBar />
      {children}
    </>
  );
}
