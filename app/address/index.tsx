// ============================================================
// AGTURONG — Delivery Address Screen
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, MapPin, Check, Trash2, Home, Briefcase } from 'lucide-react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  Shadow,
} from '../../constants/theme';
import { useAuth } from '../../store/auth';
import { useAddresses } from '../../hooks/useData';
import { supabase } from '../../lib/supabase';
import { Button, Input, LoadingScreen, EmptyState } from '../../components/ui';

const ALAMINOS_BARANGAYS = [
  'Poblacion',
  'Lucap',
  'San Jose',
  'Palamis',
  'Tanaytay',
  'Amansabina',
  'Bani',
  'Bued',
  'Inerangan',
  'Macatiw',
  'Magsaysay',
  'Pangapisan',
  'Pandan',
  'Sabangan',
  'San Vicente',
  'Tangcarang',
  'Victoria',
];

export default function AddressScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { addresses, loading, refetch } = useAddresses(user?.id);

  // Modal State for adding address
  const [modalVisible, setModalVisible] = useState(false);
  const [label, setLabel] = useState('Home');
  const [addressLine, setAddressLine] = useState('');
  const [barangay, setBarangay] = useState('Poblacion');
  const [landmark, setLandmark] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAddress = async () => {
    if (!addressLine.trim()) {
      Alert.alert('Required', 'Please enter your street or house number.');
      return;
    }
    if (!contactNumber.trim()) {
      Alert.alert('Required', 'Please enter your contact phone number.');
      return;
    }

    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to save addresses.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/signin') },
      ]);
      return;
    }

    setIsSubmitting(true);
    try {
      const isFirst = addresses.length === 0;
      const { error } = await supabase.from('delivery_addresses').insert({
        user_id: user.id,
        label,
        address_line: addressLine.trim(),
        barangay,
        city: 'Alaminos City',
        province: 'Pangasinan',
        landmark: landmark.trim() || null,
        contact_number: contactNumber.trim(),
        is_default: isFirst,
      });

      if (error) throw error;

      setModalVisible(false);
      setAddressLine('');
      setLandmark('');
      setContactNumber('');
      await refetch();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!user) return;
    try {
      // Clear defaults first
      await supabase
        .from('delivery_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set new default
      await supabase
        .from('delivery_addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      await refetch();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('delivery_addresses').delete().eq('id', addressId);
          await refetch();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Delivery Addresses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Plus size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {loading && addresses.length === 0 ? (
          <LoadingScreen message="Loading addresses..." />
        ) : addresses.length === 0 ? (
          <EmptyState
            icon={<MapPin size={48} color={Colors.textTertiary} />}
            title="No addresses saved"
            message="Add your delivery address in Alaminos City to enjoy quick ordering."
            actionLabel="Add Address"
            onAction={() => setModalVisible(true)}
          />
        ) : (
          addresses.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.addressCard,
                Shadow.sm,
                item.is_default && styles.addressCardDefault,
              ]}
              onPress={() => handleSetDefault(item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={styles.labelBadge}>
                  {item.label === 'Work' ? (
                    <Briefcase size={14} color={Colors.primary} />
                  ) : (
                    <Home size={14} color={Colors.primary} />
                  )}
                  <Text style={styles.labelText}>{item.label}</Text>
                </View>
                {item.is_default && (
                  <View style={styles.defaultTag}>
                    <Text style={styles.defaultTagText}>Default</Text>
                  </View>
                )}
              </View>

              <Text style={styles.addressLine}>{item.address_line}</Text>
              <Text style={styles.barangayLine}>
                Brgy. {item.barangay}, {item.city}, {item.province}
              </Text>
              {item.landmark && (
                <Text style={styles.landmarkLine}>Landmark: {item.landmark}</Text>
              )}
              <Text style={styles.phoneLine}>Contact: {item.contact_number}</Text>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteAddress(item.id)}
                  activeOpacity={0.7}
                >
                  <Trash2 size={16} color={Colors.error} />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>

                {item.is_default ? (
                  <View style={styles.selectedRow}>
                    <Check size={16} color={Colors.success} />
                    <Text style={styles.selectedText}>Active</Text>
                  </View>
                ) : (
                  <Text style={styles.tapToSelect}>Tap to set as default</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Modal: Add Address */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Delivery Address</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalForm}
          >
            {/* Label Selector */}
            <Text style={styles.inputSectionTitle}>Address Label</Text>
            <View style={styles.labelChips}>
              {['Home', 'Work', 'Other'].map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[
                    styles.chip,
                    label === l && styles.chipActive,
                  ]}
                  onPress={() => setLabel(l)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      label === l && styles.chipTextActive,
                    ]}
                  >
                    {l}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="House No. / Street / Purok"
              placeholder="e.g. Purok 4, Quezon Avenue"
              value={addressLine}
              onChangeText={setAddressLine}
            />

            <Text style={styles.inputSectionTitle}>Barangay (Alaminos City)</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.barangayScroll}
            >
              {ALAMINOS_BARANGAYS.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[
                    styles.chip,
                    barangay === b && styles.chipActive,
                  ]}
                  onPress={() => setBarangay(b)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      barangay === b && styles.chipTextActive,
                    ]}
                  >
                    {b}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Input
              label="Nearest Landmark"
              placeholder="e.g. Near Brgy Hall, in front of 7-Eleven"
              value={landmark}
              onChangeText={setLandmark}
            />

            <Input
              label="Contact Phone Number"
              placeholder="0917-123-4567"
              value={contactNumber}
              onChangeText={setContactNumber}
              keyboardType="phone-pad"
            />

            <Button
              title="Save Address"
              onPress={handleAddAddress}
              loading={isSubmitting}
              variant="primary"
              size="lg"
              fullWidth
              style={{ marginTop: Spacing.xl }}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  addressCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  addressCardDefault: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFAF7',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#FFF0EA',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  labelText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  defaultTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  defaultTagText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  addressLine: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  barangayLine: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  landmarkLine: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  phoneLine: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    fontWeight: FontWeight.medium,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectedText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.success,
  },
  tapToSelect: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  modalCancel: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  modalForm: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  inputSectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: -Spacing.xs,
  },
  labelChips: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  barangayScroll: {
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
});
