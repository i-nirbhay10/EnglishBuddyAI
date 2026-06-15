import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

type IconFamily = 'Ionicons' | 'MaterialIcons' | 'FontAwesome5';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  family?: IconFamily;
}

export const Icon = ({ name, size = 24, color = '#000', family = 'Ionicons' }: IconProps) => {
  switch (family) {
    case 'MaterialIcons':
      return <MaterialIcons name={name} size={size} color={color} />;
    case 'FontAwesome5':
      return <FontAwesome5 name={name} size={size} color={color} />;
    case 'Ionicons':
    default:
      return <Ionicons name={name} size={size} color={color} />;
  }
};
