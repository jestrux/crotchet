import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withDelay,
  Easing 
} from 'react-native-reanimated';
import { Theme } from './theming';

interface LoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  type?: 'spinner' | 'dots' | 'pulse';
  fullscreen?: boolean;
  icon?: React.ReactNode;
}

export function Loader({ 
  message = 'Loading...', 
  size = 'medium', 
  type = 'spinner',
  fullscreen = false,
  icon
}: LoaderProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.6);
  const dot3Opacity = useSharedValue(0.9);
  
  // Configure sizes based on the size prop
  const getSize = () => {
    switch(size) {
      case 'small': return { container: 'p-2', icon: 16, text: 'text-xs' };
      case 'large': return { container: 'p-6', icon: 40, text: 'text-lg' };
      default: return { container: 'p-4', icon: 28, text: 'text-base' };
    }
  };
  const sizeConfig = getSize();
  
  // Setup animations
  useEffect(() => {
    // Spinner animation
    rotation.value = withRepeat(
      withTiming(360, { duration: 1500, easing: Easing.linear }), 
      -1, 
      false
    );
    
    // Pulse animation
    if (type === 'pulse') {
      scale.value = withRepeat(
        withTiming(1.2, { duration: 800, easing: Easing.ease }),
        -1,
        true
      );
    }
    
    // Dots animation
    if (type === 'dots') {
      dot1Opacity.value = withRepeat(
        withTiming(1, { duration: 600 }),
        -1,
        true
      );
      
      dot2Opacity.value = withRepeat(
        withDelay(200, withTiming(1, { duration: 600 })),
        -1,
        true
      );
      
      dot3Opacity.value = withRepeat(
        withDelay(400, withTiming(1, { duration: 600 })),
        -1,
        true
      );
    }
  }, [type]);
  
  const spinStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: `${rotation.value}deg` }],
    };
  });
  
  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  
  const dot1Style = useAnimatedStyle(() => {
    return { opacity: dot1Opacity.value };
  });
  
  const dot2Style = useAnimatedStyle(() => {
    return { opacity: dot2Opacity.value };
  });
  
  const dot3Style = useAnimatedStyle(() => {
    return { opacity: dot3Opacity.value };
  });
  
  const renderLoader = () => {
    switch(type) {
      case 'dots':
        return (
          <View className="flex-row gap-2">
            <Animated.View 
              className="w-2.5 h-2.5 rounded-full bg-primary" 
              style={dot1Style} 
            />
            <Animated.View 
              className="w-2.5 h-2.5 rounded-full bg-primary"
              style={dot2Style} 
            />
            <Animated.View 
              className="w-2.5 h-2.5 rounded-full bg-primary" 
              style={dot3Style} 
            />
          </View>
        );
      case 'pulse':
        return (
          <Theme>
            {({ colors }) => (
              <Animated.View style={pulseStyle}>
                {icon || <Ionicons name="refresh-circle" size={sizeConfig.icon} color={colors.primaryColor} />}
              </Animated.View>
            )}
          </Theme>
        );
      case 'spinner':
      default:
        return (
          <Theme>
            {({ colors }) => (
              <Animated.View style={spinStyle}>
                {icon || <Ionicons name="sync" size={sizeConfig.icon} color={colors.primaryColor} />}
              </Animated.View>
            )}
          </Theme>
        );
    }
  };
  
  const containerClass = fullscreen 
    ? "flex-1 items-center justify-center bg-background"
    : `items-center justify-center ${sizeConfig.container}`;
  
  return (
    <View className={containerClass}>
      {renderLoader()}
      {message && (
        <Text className={`mt-2 text-muted-foreground ${sizeConfig.text}`}>
          {message}
        </Text>
      )}
    </View>
  );
} 