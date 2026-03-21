export function RankingPoint({ totalPoints }: { totalPoints: number }) {
  return (
    <div className="py-4 px-6">
      <div>
        <h2 className="text-base font-bold text-muted-foreground">내 포인트</h2>
      </div>
      <p
        className="text-lg font-bold text-accent-foreground"
        aria-label="내 포인트"
      >
        {(totalPoints ?? 0).toLocaleString()}P
      </p>
    </div>
  );
}
