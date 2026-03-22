"use client";

import { InfoDrawer } from "@/components/info-drawer";
import { POINTS } from "@/lib/constants";

interface PointStat {
  label: string;
  count: number;
  pointPer: number;
}

interface RankingPointProps {
  totalPoints: number;
  stats: PointStat[];
}

const POINT_RULES = [
  { label: "장소 등록", point: POINTS.PLACE_REGISTRATION },
  { label: "리뷰 작성", point: POINTS.REVIEW },
  { label: "리뷰 사진 (장당)", point: POINTS.REVIEW_PHOTO },
  { label: "코나카드 투표", point: POINTS.KONA_VOTE },
];

export function RankingPoint({ totalPoints, stats }: RankingPointProps) {
  return (
    <div className="py-4 px-6">
      <div className="flex items-center gap-1">
        <h2 className="text-base font-bold text-muted-foreground">내 포인트</h2>
        <InfoDrawer
          title="포인트 안내"
          description="활동에 따라 포인트를 받을 수 있어요"
        >
          <ul className="flex flex-col gap-2 px-4 pb-4">
            {POINT_RULES.map((rule) => (
              <li
                key={rule.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{rule.label}</span>
                <span className="font-bold text-accent-foreground">
                  {rule.point}P
                </span>
              </li>
            ))}
          </ul>
        </InfoDrawer>
      </div>
      <p className="text-lg font-bold text-accent-foreground">
        {totalPoints.toLocaleString()}P
      </p>
      {stats.length > 0 && (
        <div className="mt-3 flex flex-col gap-1">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">{stat.label}</span>
              <span className="font-bold text-accent-foreground">
                {stat.count}건
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
