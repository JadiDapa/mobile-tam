import { View } from "react-native";
import { Text } from "@/components/ui/text";

import { DateBlock } from "@/components/date-block";
import { Icon } from "@/components/icon";
import { StatColumn } from "@/components/stat-column";

export type DayStatus = "Hadir" | "Izin" | "Sakit" | "Cuti";

export type DayRecord = {
  date: string; // ISO yyyy-MM-dd
  location: string;
  status: DayStatus;
  isLate: boolean;
  checkIn: string | null;
  checkOut: string | null;
  totalHours: string;
};

// Background color of the date block — doubles as the status indicator, so no separate badge is needed.
const STATUS_DATE_BLOCK_CLASSES: Record<DayStatus, string> = {
  Hadir: "bg-primary",
  Izin: "bg-amber-600",
  Sakit: "bg-orange-600",
  Cuti: "bg-blue-600",
};

export function AttendanceCard({ record }: { record: DayRecord }) {
  return (
    <View className="flex-row gap-3 rounded-2xl bg-card p-3">
      <DateBlock
        iso={record.date}
        colorClassName={STATUS_DATE_BLOCK_CLASSES[record.status]}
      />

      <View className="flex-1 justify-center gap-3">
        <View className="flex-row">
          <StatColumn label="Check In" value={record.checkIn ?? "--:--"} />
          <StatColumn
            label="Check out"
            value={record.checkOut ?? "--:--"}
            divider
          />
          <StatColumn label="Total Hours" value={record.totalHours} divider />
        </View>

        <View className="flex-row items-center gap-1.5">
          <Icon name="location-outline" size={16} tone="muted" />
          <Text
            numberOfLines={1}
            className="flex-1 text-sm text-muted-foreground"
          >
            {record.location}
            {record.isLate ? " · Terlambat" : ""}
          </Text>
        </View>
      </View>
    </View>
  );
}
