import { useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { Avatar } from '@/components/avatar';
import { FilterTabs } from '@/components/filter-tabs';
import { ROLE_LABEL } from '@/constants/status';
import { formatShortDate } from '@/lib/date';
import { type AdminUserListItem, useAdminUsersQuery } from '@/lib/queries';

const ROLE_TABS = ['Semua', 'Karyawan', 'Admin', 'Supervisor', 'Manager'] as const;
type RoleTab = (typeof ROLE_TABS)[number];

const TAB_TO_ROLE: Record<Exclude<RoleTab, 'Semua'>, AdminUserListItem['role']> = {
  Karyawan: 'EMPLOYEE',
  Admin: 'ADMIN',
  Supervisor: 'SUPERVISOR',
  Manager: 'MANAGER',
};

function UserRow({ item }: { item: AdminUserListItem }) {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl bg-muted p-3">
      <Avatar name={item.name} imageUri={item.profileImageUrl} size={44} />
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text numberOfLines={1} className="flex-1 text-sm font-medium text-text">
            {item.name}
          </Text>
          <View className="rounded-full bg-primary/10 px-2 py-0.5">
            <Text className="text-xs font-medium text-primary">{ROLE_LABEL[item.role]}</Text>
          </View>
        </View>
        <Text className="text-xs text-muted-foreground">NIP {item.nip || '-'}</Text>
        <Text className="text-xs text-muted-foreground">
          Bergabung {item.startDate ? formatShortDate(item.startDate) : '-'}
        </Text>
      </View>
    </View>
  );
}

export default function AdminUsersScreen() {
  const [roleTab, setRoleTab] = useState<RoleTab>('Semua');
  const role = roleTab === 'Semua' ? undefined : TAB_TO_ROLE[roleTab];
  const users = useAdminUsersQuery(role);

  return (
    <View className="flex-1 bg-background">
      <View className="gap-4 px-5 pt-4">
        <FilterTabs tabs={ROLE_TABS} active={roleTab} onChange={setRoleTab} />
      </View>

      <FlatList
        data={users.data?.items ?? []}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-3 px-5 pb-5 pt-4"
        onRefresh={() => users.refetch()}
        refreshing={users.isRefetching}
        ListEmptyComponent={
          users.isPending ? (
            <ActivityIndicator className="py-10" />
          ) : users.isError ? (
            <Text className="py-10 text-center text-sm text-destructive">
              {users.error instanceof Error ? users.error.message : 'Gagal memuat data.'}
            </Text>
          ) : (
            <Text className="py-10 text-center text-sm text-muted-foreground">
              Tidak ada pengguna untuk filter ini.
            </Text>
          )
        }
        renderItem={({ item }) => <UserRow item={item} />}
      />
    </View>
  );
}
