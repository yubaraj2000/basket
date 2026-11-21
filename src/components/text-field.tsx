import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { colors, radius, type } from '@/theme';

type TextFieldProps = TextInputProps & {
  label?: string;
  icon?: IconName;
};

/** A text box with an optional label above it and an optional icon inside. The border turns green while typing. */
export function TextField({ label, icon, onFocus, onBlur, ...inputProps }: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.box, focused && styles.boxFocused]}>
        {icon ? <Icon name={icon} size={18} color={colors.muted} /> : null}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.muted}
          cursorColor={colors.primary}
          selectionColor={colors.primary}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...type.label, color: colors.muted, marginBottom: 6 },
  box: {
    height: 52,
    borderRadius: radius.button,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  boxFocused: { borderColor: colors.primary },
  input: { flex: 1, ...type.body, color: colors.text, paddingVertical: 0 },
});
