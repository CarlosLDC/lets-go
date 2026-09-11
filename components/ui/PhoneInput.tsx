import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import {
  PhonePrefixOption,
  NATIONAL_PHONE_PREFIXES,
  INTERNATIONAL_PHONE_PREFIXES,
  ALL_PHONE_PREFIXES,
  cleanPhoneNumber,
} from '../../constants/identityAndPhone';

interface PhoneInputProps {
  prefix: string;
  onPrefixChange: (prefix: string, isNational: boolean) => void;
  phoneNumber: string;
  onPhoneNumberChange: (number: string) => void;
  isNational?: boolean;
  error?: string;
  label?: string;
  disabled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  prefix,
  onPrefixChange,
  phoneNumber,
  onPhoneNumberChange,
  isNational = true,
  error,
  label = 'Teléfono',
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Encuentra la opción seleccionada o usa una por defecto
  const currentOption = useMemo(() => {
    return (
      ALL_PHONE_PREFIXES.find((p) => p.prefix === prefix) || {
        prefix,
        name: isNational ? 'Operadora' : 'Internacional',
        flag: prefix.startsWith('+') ? '🌐' : '🇻🇪',
        isNational,
      }
    );
  }, [prefix, isNational]);

  // Filtrado de prefijos
  const filteredSections = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return [
        { title: 'Operadoras de Venezuela', data: NATIONAL_PHONE_PREFIXES },
        { title: 'Códigos Internacionales', data: INTERNATIONAL_PHONE_PREFIXES },
      ];
    }

    const national = NATIONAL_PHONE_PREFIXES.filter(
      (p) =>
        p.prefix.includes(q) ||
        p.name.toLowerCase().includes(q)
    );
    const international = INTERNATIONAL_PHONE_PREFIXES.filter(
      (p) =>
        p.prefix.includes(q) ||
        p.name.toLowerCase().includes(q)
    );

    const sections = [];
    if (national.length > 0) {
      sections.push({ title: 'Operadoras de Venezuela', data: national });
    }
    if (international.length > 0) {
      sections.push({ title: 'Códigos Internacionales', data: international });
    }
    return sections;
  }, [searchQuery]);

  // Permitir usar código personalizado si busca algo que comience con +
  const canUseCustom = useMemo(() => {
    const q = searchQuery.trim();
    if (q.startsWith('+') && q.length >= 2 && !ALL_PHONE_PREFIXES.some((p) => p.prefix === q)) {
      return q;
    }
    return null;
  }, [searchQuery]);

  const handleSelectPrefix = (item: PhonePrefixOption) => {
    onPrefixChange(item.prefix, item.isNational);
    setSearchQuery('');
    setModalVisible(false);
  };

  const handleSelectCustom = (customPrefix: string) => {
    onPrefixChange(customPrefix, false);
    setSearchQuery('');
    setModalVisible(false);
  };

  const handleNumberChange = (val: string) => {
    const cleaned = cleanPhoneNumber(val);
    onPhoneNumberChange(cleaned);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputRow}>
        {/* Selector de Prefijo */}
        <TouchableOpacity
          style={[
            styles.prefixSelector,
            error ? styles.prefixSelectorError : null,
            disabled ? styles.prefixSelectorDisabled : null,
          ]}
          onPress={() => !disabled && setModalVisible(true)}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Text style={styles.flagIcon}>{currentOption.flag}</Text>
          <Text style={styles.prefixText}>{currentOption.prefix}</Text>
          <Text style={styles.chevron}>▾</Text>
        </TouchableOpacity>

        {/* Input para el resto del número */}
        <TextInput
          label={label}
          value={phoneNumber}
          onChangeText={handleNumberChange}
          keyboardType="phone-pad"
          mode="outlined"
          style={styles.phoneInput}
          outlineColor={error ? Colors.error : Colors.border}
          activeOutlineColor={Colors.mint}
          textColor={Colors.textPrimary}
          placeholder={isNational ? '123 4567' : 'Número local'}
          error={!!error}
          disabled={disabled}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Modal para selección de prefijo */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Prefijo telefónico</Text>
                <Text style={styles.sheetSubtitle}>
                  Selecciona tu operadora o país
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Buscador */}
            <TextInput
              placeholder="Buscar operadora, país o código (+57, Digitel...)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              mode="outlined"
              style={styles.searchInput}
              outlineColor={Colors.border}
              activeOutlineColor={Colors.mint}
              textColor={Colors.textPrimary}
              left={<TextInput.Icon icon="magnify" color={Colors.textSecondary} />}
              clearButtonMode="while-editing"
            />

            {/* Opción de prefijo personalizado */}
            {canUseCustom && (
              <TouchableOpacity
                style={styles.customOption}
                onPress={() => handleSelectCustom(canUseCustom)}
                activeOpacity={0.7}
              >
                <Text style={styles.customOptionFlag}>🌐</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.customOptionTitle}>
                    Usar código {canUseCustom}
                  </Text>
                  <Text style={styles.customOptionSub}>
                    Código internacional personalizado
                  </Text>
                </View>
                <Text style={styles.customOptionArrow}>→</Text>
              </TouchableOpacity>
            )}

            {/* Lista agrupada */}
            <FlatList
              data={filteredSections}
              keyExtractor={(item) => item.title}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              renderItem={({ item: section }) => (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionHeader}>{section.title}</Text>
                  <View style={styles.sectionItems}>
                    {section.data.map((opt) => {
                      const isSelected = opt.prefix === prefix;
                      return (
                        <TouchableOpacity
                          key={opt.prefix + opt.name}
                          style={[
                            styles.prefixItem,
                            isSelected && styles.prefixItemSelected,
                          ]}
                          onPress={() => handleSelectPrefix(opt)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.itemLeft}>
                            <Text style={styles.itemFlag}>{opt.flag}</Text>
                            <View>
                              <Text
                                style={[
                                  styles.itemPrefix,
                                  isSelected && styles.itemPrefixSelected,
                                ]}
                              >
                                {opt.prefix}
                              </Text>
                              <Text style={styles.itemName}>{opt.name}</Text>
                            </View>
                          </View>
                          {isSelected && (
                            <View style={styles.checkBadge}>
                              <Text style={styles.checkText}>✓</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
              ListEmptyComponent={
                !canUseCustom ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      No encontramos ningún prefijo que coincida con "{searchQuery}"
                    </Text>
                    <Text style={styles.emptySub}>
                      Escribe un código internacional como "+44" para agregarlo.
                    </Text>
                  </View>
                ) : null
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prefixSelector: {
    height: 54,
    minWidth: 98,
    paddingHorizontal: 12,
    marginTop: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  prefixSelectorError: {
    borderColor: Colors.error,
  },
  prefixSelectorDisabled: {
    opacity: 0.5,
  },
  flagIcon: {
    fontSize: 18,
  },
  prefixText: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: -1,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    marginTop: 2,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    ...Typography.headlineMedium,
    color: Colors.textPrimary,
  },
  sheetSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  searchInput: {
    backgroundColor: Colors.offWhite,
    marginBottom: 14,
  },
  customOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.mintSurface,
    borderWidth: 1.5,
    borderColor: Colors.mint,
    marginBottom: 12,
    gap: 12,
  },
  customOptionFlag: {
    fontSize: 22,
  },
  customOptionTitle: {
    ...Typography.titleMedium,
    color: Colors.navy,
    fontWeight: '700',
  },
  customOptionSub: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  customOptionArrow: {
    fontSize: 18,
    color: Colors.mintDark,
    fontWeight: '700',
  },
  list: {
    marginBottom: 8,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    ...Typography.labelMedium,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionItems: {
    gap: 6,
  },
  prefixItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.offWhite,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  prefixItemSelected: {
    borderColor: Colors.mint,
    backgroundColor: Colors.mintSurface,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  itemFlag: {
    fontSize: 22,
  },
  itemPrefix: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  itemPrefixSelected: {
    color: Colors.navy,
  },
  itemName: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: Colors.navy,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptySub: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
