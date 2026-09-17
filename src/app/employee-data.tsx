import { router } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { Icon, type IoniconsIconName } from '@/components/icon';
import { SimpleRow } from '@/components/simple-row';
import {
  EMPLOYMENT_STATUS_LABEL,
  GENDER_LABEL,
  MARITAL_STATUS_LABEL,
  RELIGION_LABEL,
} from '@/constants/status';
import { formatShortDate } from '@/lib/date';
import { useProfileDataQuery } from '@/lib/queries';

function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

const DOCUMENT_URL_FIELDS = [
  'ktpUrl',
  'npwpUrl',
  'kkUrl',
  'ijazahUrl',
  'transkripUrl',
  'sertifikatUrl',
  'bankBookUrl',
  'pasFotoUrl',
  'cvUrl',
] as const;

function PayrollRow({ icon, label, value }: { icon: IoniconsIconName; label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-3 py-2">
      <Icon name={icon} size={18} tone="muted" />
      <View className="flex-1">
        <Text className="text-xs text-muted-foreground">{label}</Text>
        <Text className="text-sm font-medium text-text">{value}</Text>
      </View>
    </View>
  );
}

export default function EmployeeDataScreen() {
  const profile = useProfileDataQuery();

  if (profile.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background px-6">
        <Text className="text-center text-muted-foreground">
          Gagal memuat data karyawan.
        </Text>
        <Pressable onPress={() => profile.refetch()} className="rounded-xl bg-primary px-6 py-3">
          <Text className="font-medium text-primary-foreground">Coba Lagi</Text>
        </Pressable>
      </View>
    );
  }

  const data = profile.data;

  const identitySubtitle = data.personalIdentity
    ? `NIK ${data.personalIdentity.nik} · ${GENDER_LABEL[data.personalIdentity.gender]}`
    : 'Belum diisi';

  const contactSubtitle = data.contact
    ? data.contact.domicileAddress
    : 'Belum diisi';

  const employmentSubtitle = data.employmentData
    ? `${data.employmentData.employeeNumber} · ${EMPLOYMENT_STATUS_LABEL[data.employmentData.employmentStatus]}`
    : 'Belum diisi';

  const workHistorySubtitle =
    data.workHistory.length > 0 ? `${data.workHistory.length} riwayat pekerjaan` : 'Belum diisi';

  const uploadedDocumentCount = data.administrativeDocument
    ? DOCUMENT_URL_FIELDS.filter((field) => Boolean(data.administrativeDocument![field])).length
    : 0;
  const documentsSubtitle = `${uploadedDocumentCount}/${DOCUMENT_URL_FIELDS.length} dokumen terunggah`;

  const trainingSubtitle = data.training.length > 0 ? `${data.training.length} pelatihan` : 'Belum diisi';

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={<RefreshControl refreshing={profile.isRefetching} onRefresh={() => profile.refetch()} />}>
      <View className="gap-5 p-5">
        <View className="gap-2">
          <Text className="text-sm font-bold text-text">Data Kepegawaian</Text>
          <View className="rounded-2xl bg-muted px-3">
            <SimpleRow
              icon="finger-print-outline"
              label="Identitas Pribadi"
              subtitle={identitySubtitle}
              onPress={() => router.push('/employee-data-identity')}
              showBorder
            />
            <SimpleRow
              icon="call-outline"
              label="Kontak"
              subtitle={contactSubtitle}
              onPress={() => router.push('/employee-data-contact')}
              showBorder
            />
            <SimpleRow
              icon="briefcase-outline"
              label="Data Kepegawaian"
              subtitle={employmentSubtitle}
              onPress={() => router.push('/employee-data-employment')}
              showBorder
            />
            <SimpleRow
              icon="time-outline"
              label="Riwayat Pekerjaan"
              subtitle={workHistorySubtitle}
              onPress={() => router.push('/employee-data-work-history')}
              showBorder
            />
            <SimpleRow
              icon="document-attach-outline"
              label="Dokumen Administrasi"
              subtitle={documentsSubtitle}
              onPress={() => router.push('/employee-data-documents')}
              showBorder
            />
            <SimpleRow
              icon="school-outline"
              label="Pelatihan"
              subtitle={trainingSubtitle}
              onPress={() => router.push('/employee-data-training')}
              showBorder={false}
            />
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-bold text-text">Penggajian</Text>
          <View className="rounded-2xl bg-muted p-3">
            {data.payroll ? (
              <View>
                <PayrollRow icon="cash-outline" label="Gaji Pokok" value={formatRupiah(data.payroll.baseSalary)} />
                <PayrollRow
                  icon="add-circle-outline"
                  label="Tunjangan"
                  value={data.payroll.allowance != null ? formatRupiah(data.payroll.allowance) : '-'}
                />
                <PayrollRow
                  icon="gift-outline"
                  label="Bonus"
                  value={data.payroll.bonus != null ? formatRupiah(data.payroll.bonus) : '-'}
                />
                <PayrollRow
                  icon="card-outline"
                  label="Rekening Bank"
                  value={`${data.payroll.bankAccountName} · ${data.payroll.bankAccountNumber}`}
                />
                <PayrollRow
                  icon="medkit-outline"
                  label="BPJS Kesehatan"
                  value={data.payroll.bpjsKesehatanNumber ?? '-'}
                />
                <PayrollRow
                  icon="shield-checkmark-outline"
                  label="BPJS Ketenagakerjaan"
                  value={data.payroll.bpjsKetenagakerjaanNumber ?? '-'}
                />
              </View>
            ) : (
              <Text className="py-2 text-sm text-muted-foreground">Belum diisi</Text>
            )}
            <View className="mt-1 flex-row items-center gap-2 border-t border-border pt-3">
              <Icon name="lock-closed-outline" size={14} tone="muted" />
              <Text className="flex-1 text-xs text-muted-foreground">
                Hanya admin yang bisa mengubah data ini.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
