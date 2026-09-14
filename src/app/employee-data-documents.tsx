import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';

import { Icon, type IoniconsIconName } from '@/components/icon';
import {
  useProfileDataQuery,
  useUpdateDocumentMutation,
  type AdministrativeDocument,
  type AdministrativeDocumentField,
} from '@/lib/queries';

const ATTACHMENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

type DocumentRow = {
  field: AdministrativeDocumentField;
  urlKey: keyof AdministrativeDocument;
  label: string;
  optional?: boolean;
  icon: IoniconsIconName;
};

const DOCUMENT_ROWS: DocumentRow[] = [
  { field: 'ktp', urlKey: 'ktpUrl', label: 'KTP', icon: 'card-outline' },
  { field: 'npwp', urlKey: 'npwpUrl', label: 'NPWP', optional: true, icon: 'document-text-outline' },
  { field: 'kk', urlKey: 'kkUrl', label: 'Kartu Keluarga', icon: 'people-outline' },
  { field: 'ijazah', urlKey: 'ijazahUrl', label: 'Ijazah', icon: 'school-outline' },
  { field: 'transkrip', urlKey: 'transkripUrl', label: 'Transkrip Nilai', icon: 'reader-outline' },
  { field: 'sertifikat', urlKey: 'sertifikatUrl', label: 'Sertifikat', icon: 'ribbon-outline' },
  {
    field: 'bankBook',
    urlKey: 'bankBookUrl',
    label: 'Buku Rekening (CIMB Niaga)',
    icon: 'book-outline',
  },
  { field: 'pasFoto', urlKey: 'pasFotoUrl', label: 'Pas Foto', icon: 'image-outline' },
  { field: 'cv', urlKey: 'cvUrl', label: 'CV Terbaru', icon: 'briefcase-outline' },
];

export default function EmployeeDataDocumentsScreen() {
  const profile = useProfileDataQuery();
  const updateMutation = useUpdateDocumentMutation();
  const [uploadingField, setUploadingField] = useState<AdministrativeDocumentField | null>(null);

  async function handleUpload(row: DocumentRow) {
    const result = await DocumentPicker.getDocumentAsync({
      type: ATTACHMENT_TYPES,
      copyToCacheDirectory: true,
    });

    if (result.canceled || result.assets.length === 0) return;

    const asset = result.assets[0];
    const formData = new FormData();
    formData.append(row.field, new File(asset.uri), asset.name);

    setUploadingField(row.field);
    updateMutation.mutate(formData, {
      onSuccess: (mutationResult) => {
        setUploadingField(null);
        if (!mutationResult.ok) {
          Alert.alert('Gagal Mengunggah', mutationResult.error);
          return;
        }
        Alert.alert('Berhasil', mutationResult.message);
      },
      onError: (error) => {
        setUploadingField(null);
        Alert.alert('Gagal Mengunggah', error instanceof Error ? error.message : 'Coba lagi.');
      },
    });
  }

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
          Gagal memuat dokumen.
        </Text>
        <Pressable onPress={() => profile.refetch()} className="rounded-xl bg-primary px-6 py-3">
          <Text className="font-medium text-primary-foreground">Coba Lagi</Text>
        </Pressable>
      </View>
    );
  }

  const documents = profile.data.administrativeDocument;

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-3 p-5">
        <Text className="text-xs text-muted-foreground">
          JPG, PNG, WEBP, atau PDF, maks 5MB per dokumen. Setiap dokumen diunggah satu per satu.
        </Text>

        {DOCUMENT_ROWS.map((row) => {
          const url = documents?.[row.urlKey] ?? null;
          const isUploading = uploadingField === row.field && updateMutation.isPending;

          return (
            <View
              key={row.field}
              className="gap-2 rounded-2xl bg-muted p-3">
              <View className="flex-row items-center gap-3">
                <Icon name={row.icon} size={20} tone={url ? 'success' : 'muted'} />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-text">
                    {row.label}
                    {row.optional ? ' (opsional)' : ''}
                  </Text>
                  {url ? (
                    <Pressable onPress={() => Linking.openURL(url)}>
                      <Text
                        numberOfLines={1}
                        className="text-xs text-primary underline">
                        Lihat dokumen
                      </Text>
                    </Pressable>
                  ) : (
                    <Text className="text-xs text-muted-foreground">
                      Belum diunggah
                    </Text>
                  )}
                </View>
              </View>

              <Pressable
                onPress={() => handleUpload(row)}
                disabled={isUploading}
                className="flex-row items-center justify-center gap-2 rounded-xl bg-primary py-2.5 disabled:opacity-60">
                {isUploading && <ActivityIndicator color="white" size="small" />}
                <Text className="text-sm font-medium text-primary-foreground">{url ? 'Ganti' : 'Upload'}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
