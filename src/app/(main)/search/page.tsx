import { PlaceSearch } from "@/components/place-search";

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-4">
      <PlaceSearch autoFocus />
    </div>
  );
}
