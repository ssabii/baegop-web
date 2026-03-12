export const placeKeys = {
  all: ["places"] as const,
  list: (tab: string) => [...placeKeys.all, tab] as const,
  data: (naverPlaceId: string) => ["place-data", naverPlaceId] as const,
};

export const reviewKeys = {
  all: ["reviews"] as const,
  list: (placeId: string) => [...reviewKeys.all, placeId] as const,
};

export const menuKeys = {
  all: ["menus"] as const,
  list: (naverPlaceId: string) => [...menuKeys.all, naverPlaceId] as const,
};

export const profileKeys = {
  all: ["profile"] as const,
};

export const favoriteKeys = {
  all: ["favorites"] as const,
};

export const searchKeys = {
  places: (query: string, lat?: number, lng?: number) =>
    ["search-places", query, lat, lng] as const,
};

export const mapKeys = {
  places: ["map-places"] as const,
};

export const mypageKeys = {
  all: ["mypage"] as const,
  reviews: (userId: string) => [...mypageKeys.all, "reviews", userId] as const,
  places: () => [...mypageKeys.all, "places"] as const,
  feedbacks: (userId?: string) =>
    userId
      ? ([...mypageKeys.all, "feedbacks", userId] as const)
      : ([...mypageKeys.all, "feedbacks"] as const),
};
