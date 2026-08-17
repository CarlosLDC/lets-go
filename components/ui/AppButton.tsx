import React from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Button } from 'react-native-paper';
import { Colors } from '../../constants/colors';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  fullWidth = true,
  style,
}) => {
  const getMode = () => {
    switch (variant) {
      case 'primary': return 'contained';
      case 'secondary': return 'contained';
      case 'outline': return 'outlined';
      case 'ghost': return 'text';
    }
  };

  const getButtonColor = () => {
    switch (variant) {
      case 'primary': return Colors.mint;
      case 'secondary': return Colors.navy;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
    }
  };

  const getLabelColor = () => {
    switch (variant) {
      case 'primary': return Colors.navy;
      case 'secondary': return Colors.white;
      case 'outline': return Colors.navy;
      case 'ghost': return Colors.mint;
    }
  };

  return (
    <Button
      mode={getMode()}
      onPress={onPress}
      disabled={disabled || loading}
      loading={loading}
      icon={icon}
      buttonColor={getButtonColor()}
      textColor={getLabelColor()}
      contentStyle={styles.content}
      labelStyle={styles.label}
      style={[
        styles.button,
        variant === 'outline' && styles.outlineButton,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {label}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  outlineButton: {
    borderColor: Colors.navy,
    borderWidth: 1.5,
  },
  content: {
    height: 52,
    paddingHorizontal: 8,
  },
  label: {
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  fullWidth: {
    width: '100%',
  },
});
