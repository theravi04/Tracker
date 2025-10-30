import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import * as LucideIcons from 'lucide-react-native';

type LucideIconName = keyof typeof LucideIcons;

interface IconSymbolProps {
  name: LucideIconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function IconSymbol({
  name,
  size = 24,
  color = '#000',
  style,
}: IconSymbolProps) {
  const IconComponent = LucideIcons[name] as React.ComponentType<{
    color?: string;
    size?: number;
    style?: StyleProp<ViewStyle>;
  }>;

  if (!IconComponent) {
    console.warn(`Lucide icon "${name}" not found`);
    return null;
  }

  return <IconComponent color={color} size={size} style={style} />;
}
