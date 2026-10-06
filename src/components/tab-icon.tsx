import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';

type TabIconProps = {
  name: SymbolViewProps['name'];
  // Shown while the tab is open (usually the filled symbol).
  selectedName?: SymbolViewProps['name'];
  focused: boolean;
  color: ColorValue;
  size: number;
};

// A tab bar icon: an SF Symbol on iOS, a Material Symbol on Android.
export function TabIcon({ name, selectedName, focused, color, size }: TabIconProps) {
  return (
    <SymbolView
      name={focused && selectedName ? selectedName : name}
      tintColor={color}
      size={size}
    />
  );
}
