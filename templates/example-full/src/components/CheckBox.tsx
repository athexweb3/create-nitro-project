import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

interface CheckBoxProps {
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  color?: string;
  size?: number;
}

export function CheckBox({ value, onValueChange, color = '#007AFF', size = 24 }: CheckBoxProps) {
  return (
    <TouchableOpacity onPress={() => onValueChange(!value)} activeOpacity={0.8}>
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderColor: color,
            backgroundColor: value ? color : 'transparent',
          },
        ]}
      >
        {value && <View style={styles.checkmark} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: '60%',
    height: '60%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
});
