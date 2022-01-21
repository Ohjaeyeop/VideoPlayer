import React, {useState} from 'react';
import {Text, SafeAreaView, TouchableOpacity} from 'react-native';
import VideoComponent from './VideoComponent';

const Home = () => {
  const [videoVisible, setVideoVisible] = useState(false);

  const handleVisible = () => {
    setVideoVisible(!videoVisible);
  };

  return (
    <SafeAreaView>
      <VideoComponent visible={videoVisible} handleVisible={handleVisible} />
      <TouchableOpacity onPress={handleVisible} style={{padding: 10}}>
        <Text>Video</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Home;
