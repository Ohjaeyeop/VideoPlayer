import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, ScrollView, Text} from 'react-native';

const ScrollLoop = ({text1, text2}: {text1: string; text2: string}) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [scrollWidth, setScrollWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    const diff = textWidth - scrollWidth;
    if (diff > 0) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scrollX, {
            toValue: -diff,
            duration: diff / 0.02,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
          Animated.delay(2000),
          Animated.timing(scrollX, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => {
        loop.stop();
      };
    }
  }, [scrollWidth, scrollX, textWidth]);

  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      onStartShouldSetResponder={() => true}
      onLayout={e => setScrollWidth(e.nativeEvent.layout.width)}>
      <Animated.View
        style={{justifyContent: 'center', transform: [{translateX: scrollX}]}}
        onLayout={e => setTextWidth(e.nativeEvent.layout.width)}>
        <Text>
          <Text style={{fontWeight: 'bold'}}>{text1} </Text>
          <Text>{text2}</Text>
        </Text>
      </Animated.View>
    </ScrollView>
  );
};

export default ScrollLoop;
