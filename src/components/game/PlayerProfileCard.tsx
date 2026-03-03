"use client";

import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui/pixelact-ui";
import { CAREER_LEVELS, MAX_ENERGY } from "@/lib/game/constants";
import { PROFESSION_NAMES } from "@/lib/game/professions";
import { AnimatedNumber } from "@/components/game/AnimatedNumber";

export interface PlayerProfileData {
  level: number;
  profession: string;
  exp: number;
  money: number;
  reputation: number;
  energy: number;
}

interface PlayerProfileCardProps {
  data: PlayerProfileData;
  lastDeltas?: { exp?: number; money?: number; energy?: number };
}

export function PlayerProfileCard({ data, lastDeltas }: PlayerProfileCardProps) {
  const levelInfo = CAREER_LEVELS[data.level];
  const professionName =
    PROFESSION_NAMES[data.profession as keyof typeof PROFESSION_NAMES] ?? "—";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="pixel-font text-base">
            {levelInfo?.name ?? "Безработный"}
          </CardTitle>
          <p className="mt-0.5 pixel-font text-xs text-muted-foreground">{professionName}</p>
        </div>
        <Badge variant="default" className="pixel-font text-[10px]">
          Lv.{data.level}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-3 py-2">
            <span className="text-lg">⚡</span>
            <div>
              <p className="font-medium">
                <AnimatedNumber
                  value={data.energy}
                  suffix={`/${MAX_ENERGY}`}
                  delta={lastDeltas?.energy}
                  countDuration={350}
                />
              </p>
              <p className="pixel-font text-[10px] text-muted-foreground">Энергия</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded bg-muted/50 px-3 py-2">
            <span className="text-lg">💰</span>
            <div>
              <p className="font-medium">
                <AnimatedNumber
                  value={data.money}
                  suffix="$"
                  delta={lastDeltas?.money}
                  countDuration={350}
                />
              </p>
              <p className="pixel-font text-[10px] text-muted-foreground">Деньги</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded bg-muted/50 px-3 py-2">
            <span className="text-lg">📘</span>
            <div>
              <p className="font-medium">
                <AnimatedNumber
                  value={data.exp}
                  suffix=" EXP"
                  delta={lastDeltas?.exp}
                  countDuration={350}
                />
              </p>
              <p className="pixel-font text-[10px] text-muted-foreground">Опыт</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded bg-muted/50 px-3 py-2">
            <span className="text-lg">⭐</span>
            <div>
              <p className="font-medium">{data.reputation}</p>
              <p className="pixel-font text-[10px] text-muted-foreground">Репутация</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
