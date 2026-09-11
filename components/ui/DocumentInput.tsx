import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import {
  DocumentType,
  DOCUMENT_TYPES,
  DocumentTypeOption,
  cleanDocumentNumber,
} from '../../constants/identityAndPhone';

interface DocumentInputProps {
  documentType: DocumentType;
  onDocumentTypeChange: (type: DocumentType) => void;
  documentNumber: string;
  onDocumentNumberChange: (number: string) => void;
  error?: string;
  label?: string;
  disabled?: boolean;
}

export const DocumentInput: React.FC<DocumentInputProps> = ({
  documentType,
  onDocumentTypeChange,
  documentNumber,
  onDocumentNumberChange,
  error,
  label = 'Documento de identidad',
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption =
    DOCUMENT_TYPES.find((opt) => opt.id === documentType) || DOCUMENT_TYPES[0];

  const handleSelectType = (option: DocumentTypeOption) => {
    onDocumentTypeChange(option.id);
    // Limpiar caracteres no válidos si cambia de pasaporte a cédula o viceversa
    const cleaned = cleanDocumentNumber(option.id, documentNumber);
    onDocumentNumberChange(cleaned);
    setModalVisible(false);
  };

  const handleNumberChange = (val: string) => {
    const cleaned = cleanDocumentNumber(documentType, val);
    onDocumentNumberChange(cleaned);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputRow}>
        {/* Selector de tipo (V / E / P) */}
        <TouchableOpacity
          style={[
            styles.typeSelector,
            error ? styles.typeSelectorError : null,
            disabled ? styles.typeSelectorDisabled : null,
          ]}
          onPress={() => !disabled && setModalVisible(true)}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Text style={styles.flagIcon}>{selectedOption.flag}</Text>
          <Text style={styles.typeText}>{selectedOption.shortLabel}</Text>
          <Text style={styles.chevron}>▾</Text>
        </TouchableOpacity>

        {/* Campo para el número */}
        <TextInput
          label={label}
          value={documentNumber}
          onChangeText={handleNumberChange}
          keyboardType={documentType === 'P' ? 'default' : 'numeric'}
          autoCapitalize={documentType === 'P' ? 'characters' : 'none'}
          mode="outlined"
          style={styles.numberInput}
          outlineColor={error ? Colors.error : Colors.border}
          activeOutlineColor={Colors.mint}
          textColor={Colors.textPrimary}
          placeholder={selectedOption.placeholder}
          error={!!error}
          disabled={disabled}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Modal de selección de tipo de documento */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tipo de documento</Text>
              <Text style={styles.modalSubtitle}>
                Selecciona tu documento de identidad
              </Text>
            </View>

            <View style={styles.optionsList}>
              {DOCUMENT_TYPES.map((option) => {
                const isSelected = option.id === documentType;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionItemSelected,
                    ]}
                    onPress={() => handleSelectType(option)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionLeft}>
                      <Text style={styles.optionFlag}>{option.flag}</Text>
                      <View>
                        <Text
                          style={[
                            styles.optionLabel,
                            isSelected && styles.optionLabelSelected,
                          ]}
                        >
                          {option.shortLabel} - {option.label}
                        </Text>
                        <Text style={styles.optionDesc}>
                          {option.description}
                        </Text>
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
  typeSelector: {
    height: 54,
    minWidth: 84,
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
  typeSelectorError: {
    borderColor: Colors.error,
  },
  typeSelectorDisabled: {
    opacity: 0.5,
  },
  flagIcon: {
    fontSize: 18,
  },
  typeText: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: -1,
  },
  numberInput: {
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    ...Typography.headlineMedium,
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.offWhite,
  },
  optionItemSelected: {
    borderColor: Colors.mint,
    backgroundColor: Colors.mintSurface,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionFlag: {
    fontSize: 24,
  },
  optionLabel: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  optionLabelSelected: {
    color: Colors.navy,
  },
  optionDesc: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: Colors.navy,
    fontSize: 14,
    fontWeight: '700',
  },
});
