import { Platform } from 'react-native';
import Animated from 'react-native-reanimated';

export function HelloWave() {
  if (Platform.OS === 'web') {
    return (
      <span style={{ fontSize: 28, lineHeight: '32px', marginTop: -6, display: 'inline-block' }}>👋</span>
    );
  }
  return (
    <Animated.Text
      style={{
        fontSize: 28,
        lineHeight: 32,
        marginTop: -6,
      }}>
      👋
    </Animated.Text>
  );
}
