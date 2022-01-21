import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

type Props = {
  playableDuration: number;
  duration: number;
  width: number;
};

const PlayableBar = ({playableDuration, duration, width}: Props) => {
  const offset = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: offset.value,
    };
  });
  useEffect(() => {
    offset.value = (width * playableDuration) / duration;
  }, [duration, offset, playableDuration, width]);
  return <Animated.View style={[styles.playableBar, animatedStyle]} />;
};

const styles = StyleSheet.create({
  playableBar: {
    position: 'absolute',
    height: 4,
    width: 0,
    backgroundColor: '#FFFAFA',
  },
});

export default PlayableBar;
