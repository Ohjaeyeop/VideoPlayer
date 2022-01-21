import React, {useCallback, useRef, useState} from 'react';
import Video, {OnProgressData} from 'react-native-video';
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Animatable from 'react-native-animatable';
import {Icon} from 'react-native-elements';
import Slider, {SliderRef} from './Slider';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import PlayableBar from './PlayableBar';
import {PanGestureHandler} from 'react-native-gesture-handler';
import ButtonController from './ButtonController';
import ScrollLoop from './ScrollLoop';

const statusBarHeight = getStatusBarHeight(true);
const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;
const initialVideoHeight = width * 0.5625;
const text1 = 'VideoVideoVideo';
const text2 = 'descriptiondescriptiondescription';

type Props = {
  visible: boolean;
  handleVisible: () => void;
};

const VideoComponent = ({visible, handleVisible}: Props) => {
  const videoRef = useRef<Video>(null);
  const videoControlRef = useRef<Animatable.View & View>(null);
  const timerId = useRef<NodeJS.Timeout | null>(null);
  const prevPausedState = useRef<boolean>(false);
  const isSliding = useRef<boolean>(false);
  const sliderRef = useRef<SliderRef>(null);
  const [controllerOpacity, setControllerOpacity] = useState(1);
  const [paused, setPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playableDuration, setPlayableDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [videoWidthState, setVideoWidthState] = useState(width);

  function initializeValue() {
    handleVisible();
    setIsEnded(false);
    setIsMinimized(false);
    setPaused(false);
    videoWidth.value = width;
    videoHeight.value = height;
    offset.value = 0;
  }

  function handleLoad(payload: {
    duration: React.SetStateAction<number>;
    currentTime: React.SetStateAction<number>;
  }) {
    setDuration(payload.duration);
    handleCurrentTime(payload.currentTime);
  }

  function handleProgress(progress: OnProgressData) {
    handleCurrentTime(progress.currentTime);
    setPlayableDuration(progress.playableDuration);
  }

  const slidingStart = useCallback(() => {
    prevPausedState.current = paused;
    isSliding.current = true;
    setPaused(true);
    if (timerId.current) {
      clearTimeout(timerId.current);
    }
  }, [paused]);

  function togglePlayPause() {
    if (isEnded) {
      handleCurrentTime(0);
      moveTo(0);
      setIsEnded(false);
      sliderRef.current?.initializeStart();
    }
    setPaused(prevState => !prevState);
    if (timerId.current) {
      clearTimeout(timerId.current);
    }
    if (paused) {
      timerId.current = setTimeout(fadeOut, 4000);
    }
  }

  const moveTo = useCallback((time: number) => {
    videoRef.current?.seek(time);
  }, []);

  const slidingEnd = useCallback(() => {
    isSliding.current = false;
    setPaused(prevPausedState.current);
    moveTo(currentTime);
    if (!paused) {
      timerId.current = setTimeout(fadeOut, 4000);
    }
  }, [currentTime, moveTo, paused]);

  const handleCurrentTime = useCallback(
    time => {
      if (isEnded && time < duration) {
        setIsEnded(false);
      }
      setCurrentTime(time);
    },
    [duration, isEnded],
  );

  function skip(second: number) {
    if (timerId.current) {
      clearTimeout(timerId.current);
    }
    if (!paused) {
      timerId.current = setTimeout(fadeOut, 4000);
    }
    handleCurrentTime(Math.min(duration, Math.max(0, currentTime + second)));
    moveTo(Math.floor(Math.min(duration, Math.max(0, currentTime + second))));
  }

  function displayedTime(time: number) {
    const minute = Math.floor(time / 60);
    let second = Math.floor(time % 60);
    return `${minute}:${second < 10 ? '0' + second : second}`;
  }

  function handleFullScreen() {
    setIsFullScreen(true);
  }

  function fadeOut() {
    if (!isSliding.current) {
      videoControlRef.current?.transitionTo({opacity: 0});
      setControllerOpacity(1);
      sliderRef.current?.hideCircle();
    }
  }

  function lifting() {
    'worklet';
    offset.value = withTiming(0);
    setIsMinimized(false);
  }

  function handleVideoControllerPress() {
    if (isSliding.current) {
      return;
    }
    if (isMinimized) {
      lifting();
      return;
    }
    if (timerId.current) {
      clearTimeout(timerId.current);
    }
    videoControlRef.current?.transitionTo({opacity: controllerOpacity});
    setControllerOpacity(prevState => (prevState ? 0 : 1));
    if (controllerOpacity && !paused) {
      timerId.current = setTimeout(fadeOut, 4000);
    } else {
      sliderRef.current?.hideCircle();
    }
  }

  function handleEnd() {
    setPaused(true);
    setIsEnded(true);
    videoControlRef.current?.transitionTo({opacity: 1});
    setControllerOpacity(0);
  }

  const offset = useSharedValue(0);

  const panGesture = useAnimatedGestureHandler({
    onStart: () => {
      setIsMinimized(false);
    },
    onActive: event => {
      offset.value =
        event.velocityY < 1000
          ? event.translationY
          : withTiming(height - initialVideoHeight * 0.5 - statusBarHeight);
      if (offset.value < 0) {
        offset.value = 0;
      }
    },
    onEnd: () => {
      offset.value =
        offset.value < (height - initialVideoHeight) / 2
          ? withTiming(0)
          : withTiming(height - initialVideoHeight * 0.5 - statusBarHeight);
      if (offset.value >= (height - initialVideoHeight) / 2) {
        runOnJS(fadeOut)();
        runOnJS(setIsMinimized)(true);
      }
    },
  });

  const animatedModalStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: offset.value}],
    };
  });

  const animatedDescriptionStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        offset.value,
        [height * 0.4, height - initialVideoHeight * 0.5 - statusBarHeight],
        [1, 0],
      ),
    };
  });

  const videoWidth = useSharedValue(width);
  const videoHeight = useSharedValue(initialVideoHeight);
  const animatedVideoStyle = useAnimatedStyle(() => {
    videoWidth.value =
      offset.value < height * 0.4
        ? width
        : interpolate(
            offset.value,
            [height * 0.4, height - initialVideoHeight * 0.5 - statusBarHeight],
            [width, width * 0.3],
          );
    videoHeight.value =
      offset.value < height * 0.4
        ? initialVideoHeight
        : interpolate(
            offset.value,
            [height * 0.4, height - initialVideoHeight * 0.5 - statusBarHeight],
            [initialVideoHeight, initialVideoHeight * 0.3],
          );
    return {
      width: videoWidth.value,
      height: videoHeight.value,
    };
  });

  const animatedMinimizedViewStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(videoWidth.value, [width, 0], [0, width]),
      height: videoHeight.value,
    };
  });

  return (
    <Modal visible={visible} transparent={true}>
      <PanGestureHandler onGestureEvent={panGesture} enabled={!isMinimized}>
        <Animated.View style={[animatedModalStyle]}>
          <Animated.View
            style={[styles.videoContainer, animatedVideoStyle]}
            onLayout={e => setVideoWidthState(e.nativeEvent.layout.width)}>
            <Video
              ref={videoRef}
              source={{
                uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
              }}
              resizeMode="cover"
              paused={paused}
              fullscreen={isFullScreen}
              fullscreenAutorotate={true}
              style={{width: '100%', height: '100%'}}
              onLoad={handleLoad}
              onProgress={handleProgress}
              onEnd={handleEnd}
            />
            <TouchableWithoutFeedback onPress={handleVideoControllerPress}>
              <Animatable.View
                style={styles.videoController}
                ref={videoControlRef}>
                <Animatable.View style={styles.videoBackground} />
                <ButtonController
                  skip={skip}
                  opacity={controllerOpacity}
                  togglePlayPause={togglePlayPause}
                  paused={paused}
                  isEnded={isEnded}
                />
                <View style={[styles.videoFooter]}>
                  <Text style={{color: 'white', left: 10}}>
                    {displayedTime(currentTime)} / {displayedTime(duration)}
                  </Text>
                  <TouchableOpacity
                    style={{right: 10}}
                    onPress={handleFullScreen}
                    disabled={!!controllerOpacity}>
                    <Icon
                      name="fullscreen"
                      size={20}
                      color="white"
                      tvParallaxProperties={undefined}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.slider}>
                  <View style={styles.sliderBar} />
                  <Slider
                    duration={duration}
                    currentTime={currentTime}
                    setCurrentTime={handleCurrentTime}
                    slidingStart={slidingStart}
                    slidingEnd={slidingEnd}
                    width={videoWidthState}
                    ref={sliderRef}
                  />
                  <PlayableBar
                    playableDuration={playableDuration}
                    duration={duration}
                    width={videoWidth.value}
                  />
                </View>
              </Animatable.View>
            </TouchableWithoutFeedback>
            <Animated.View
              style={[styles.videoDescription, animatedDescriptionStyle]}>
              <Text style={{fontWeight: 'bold'}}>{text1}</Text>
              <Text>{text2}</Text>
            </Animated.View>
          </Animated.View>
          <Animated.View
            style={[styles.minimizedView, animatedMinimizedViewStyle]}
            onStartShouldSetResponder={() => true}>
            <TouchableWithoutFeedback onPress={lifting}>
              <View style={{width: '70%'}}>
                <ScrollLoop text1={text1} text2={text2} />
              </View>
            </TouchableWithoutFeedback>
            <View style={styles.minimizedButton}>
              <TouchableOpacity onPress={togglePlayPause}>
                <Icon
                  name={isEnded ? 'replay' : paused ? 'play-arrow' : 'pause'}
                  size={25}
                  color="black"
                  tvParallaxProperties={undefined}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={initializeValue}>
                <Icon
                  name="close"
                  size={25}
                  color="black"
                  tvParallaxProperties={undefined}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    </Modal>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    position: 'absolute',
    top: statusBarHeight,
    width: width,
    height: initialVideoHeight,
    backgroundColor: 'black',
  },
  videoBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'gray',
    opacity: 0.3,
  },
  videoController: {
    opacity: 0,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  videoFooter: {
    position: 'absolute',
    width: '100%',
    bottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  slider: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  sliderBar: {
    position: 'absolute',
    height: 4,
    width: '100%',
    backgroundColor: '#A9A9A9',
  },
  videoDescription: {
    position: 'absolute',
    padding: 10,
    bottom: -55,
    width: width,
  },
  minimizedView: {
    position: 'absolute',
    top: statusBarHeight,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  minimizedButton: {
    width: '30%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});

export default VideoComponent;
