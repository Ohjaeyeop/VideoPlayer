import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Icon} from 'react-native-elements';

type Props = {
  skip: (second: number) => void;
  opacity: number;
  isEnded: boolean;
  paused: boolean;
  togglePlayPause: () => void;
};

const ButtonController = ({
  skip,
  opacity,
  isEnded,
  paused,
  togglePlayPause,
}: Props) => {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity onPress={() => skip(-10)} disabled={!!opacity}>
        <Icon
          name="replay-10"
          size={50}
          color="white"
          tvParallaxProperties={undefined}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={togglePlayPause} disabled={!!opacity}>
        <Icon
          name={isEnded ? 'replay' : paused ? 'play-arrow' : 'pause'}
          size={50}
          color="white"
          tvParallaxProperties={undefined}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => skip(10)} disabled={!!opacity}>
        <Icon
          name="forward-10"
          size={50}
          color="white"
          tvParallaxProperties={undefined}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    flexDirection: 'row',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ButtonController;
