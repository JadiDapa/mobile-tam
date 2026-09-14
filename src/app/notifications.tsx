import { ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { Icon, type IconTone, type IoniconsIconName } from '@/components/icon';

type NotificationItem = {
  id: string;
  icon: IoniconsIconName;
  tone: IconTone;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

// Placeholder — swap with real data later, the row rendering below doesn't care about content.
const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    icon: 'checkmark-circle-outline',
    tone: 'success',
    title: 'Absensi Disetujui',
    body: 'Absen luar kantor tanggal 7 Sep 2026 telah disetujui admin.',
    time: '2 jam lalu',
    read: false,
  },
  {
    id: 'n2',
    icon: 'document-text-outline',
    tone: 'primary',
    title: 'Pengajuan Izin Diproses',
    body: 'Pengajuan Izin Keperluan Keluarga sedang menunggu persetujuan.',
    time: '1 hari lalu',
    read: false,
  },
  {
    id: 'n3',
    icon: 'timer-outline',
    tone: 'success',
    title: 'Lembur Disetujui',
    body: 'Pengajuan lembur tanggal 9 Sep 2026 telah disetujui.',
    time: '2 hari lalu',
    read: true,
  },
  {
    id: 'n4',
    icon: 'megaphone-outline',
    tone: 'muted',
    title: 'Pengumuman',
    body: 'Jadwal libur cuti bersama telah diperbarui, cek menu Kalender.',
    time: '4 hari lalu',
    read: true,
  },
];

function NotificationRow({ item }: { item: NotificationItem }) {
  return (
    <View className="flex-row gap-3 border-b border-border py-4">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Icon name={item.icon} tone={item.tone} size={20} />
      </View>

      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text numberOfLines={1} className="flex-1 text-sm font-bold text-text">
            {item.title}
          </Text>
          {!item.read && <View className="h-2 w-2 rounded-full bg-primary" />}
        </View>
        <Text numberOfLines={2} className="text-sm text-muted-foreground">
          {item.body}
        </Text>
        <Text className="text-xs text-muted-foreground">{item.time}</Text>
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-5">
        {NOTIFICATIONS.length === 0 ? (
          <Text className="py-10 text-center text-sm text-muted-foreground">
            Belum ada notifikasi.
          </Text>
        ) : (
          NOTIFICATIONS.map((item) => <NotificationRow key={item.id} item={item} />)
        )}
      </View>
    </ScrollView>
  );
}
