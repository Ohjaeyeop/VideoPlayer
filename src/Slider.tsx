import React, {useCallback, useEffect, useImperativeHandle} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {PanGestureHandler} from 'react-native-gesture-handler';

export type SliderRef = {
  hideCircle: () => void;
  initializeStart: () => void;
};

type Props = {
  duration: number;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  slidingStart: () => void;
  slidingEnd: () => void;
  width: number;
};

const Slider = (props: Props, ref: React.Ref<SliderRef>) => {
  const {
    duration,
    currentTime,
    setCurrentTime,
    slidingStart,
    slidingEnd,
    width,
  } = props;
  const offset = useSharedValue(0);
  const circleScale = useSharedValue(1);
  const circleOpacity = useSharedValue(0);

  const animatedCircleStyles = useAnimatedStyle(() => {
    return {
      transform: [{translateX: offset.value}, {scale: circleScale.value}],
      opacity: circleOpacity.value,
    };
  });
  const animatedColorBarStyles = useAnimatedStyle(() => {
    return {
      width: offset.value + 5,
    };
  });

  const start = useSharedValue(0);
  const panGesture = useAnimatedGestureHandler({
    onStart: () => {
      circleOpacity.value = withSpring(1);
      circleScale.value = withSpring(1.2);
      runOnJS(slidingStart)();
    },
    onActive: event => {
      offset.value = Math.min(
        width,
        Math.max(0, event.translationX + start.value),
      );
      runOnJS(setCurrentTime)(duration * (offset.value / width));
    },
    onFinish: () => {
      start.value = offset.value;
      circleScale.value = withSpring(1);
      runOnJS(slidingEnd)();
    },
  });

  const hideCircle = useCallback(() => {
    'worklet';
    circleOpacity.value = withSpring(0);
  }, [circleOpacity]);

  const initializeStart = useCallback(() => {
    start.value = 0;
  }, [start]);

  useImperativeHandle(
    ref,
    () => ({
      hideCircle,
      initializeStart,
    }),
    [hideCircle, initializeStart],
  );

  useEffect(() => {
    if (circleScale.value !== 1.2) {
      offset.value = (width * currentTime) / duration;
    }
  }, [circleScale.value, currentTime, duration, offset, width]);

  return (
    <>
      <Animated.View style={[styles.sliderColorBar, animatedColorBarStyles]} />
      <PanGestureHandler onGestureEvent={panGesture}>
        <Animated.View style={[styles.sliderCircle, animatedCircleStyles]} />
      </PanGestureHandler>
    </>
  );
};

const styles = StyleSheet.create({
  sliderColorBar: {
    position: 'absolute',
    zIndex: 1,
    height: 4,
    width: 0,
    backgroundColor: '#6d5ad2',
  },
  sliderCircle: {
    position: 'absolute',
    zIndex: 1,
    top: -2.5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6d5ad2',
    opacity: 0,
  },
});

export default React.forwardRef(Slider);
