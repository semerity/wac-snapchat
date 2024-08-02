import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, ScrollView, View, FlatList, StatusBar, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import GestureRecognizer from 'react-native-swipe-gestures';
import * as SecureStore from "expo-secure-store";
import axios from 'axios';
import { tokenApi } from "../../conf.json";
import { useColorScheme } from '@/hooks/useColorScheme';


export default function TabTwoScreen() {
  const [image, setImage] = useState('');
  const [timer, setTimer] = useState(null);
  const [timerSnap, setTimerSnap] = useState(null);
  const [timerCooldown, setTimerCooldown] = useState(null);
  const [count, setCount] = useState(0);
  const [selectedId, setSelectedId] = useState();
  const [loading, setLoading] = useState(true);
  const [DATA, setDATA] = useState([]);
  const router = useRouter();
  const tokenStore = SecureStore.getItem('token');
  const colorScheme = useColorScheme();

  useEffect(() => {
    getAllSnaps();
  }, [count]);

  async function getAllSnaps() {
    try {
      setLoading(true)
      const response = await axios.get('https://snapchat.epidoc.eu/snap', { headers: { 'Authorization': 'Bearer ' + await tokenStore, 'X-API-Key': tokenApi } });
      const responseLength = response.data.data.length;
      let newData = [];

      for (let i = 0; i < responseLength; i++) {
        let user_send = (response.data.data[i].from);
        let picture_id = (response.data.data[i]._id);
        const username = await getUserInfo(user_send);
        const { image, duration } = await getAllData(picture_id);
        newData.push({ id: picture_id, username, picture: image, duration });
      }

      setDATA(newData);
      setLoading(false);
    } catch (error) {
      console.log(error)
    }
  }

  async function getUserInfo(id_send) {
    try {
      const response = await axios.get('https://snapchat.epidoc.eu/user/' + id_send, { headers: { 'Authorization': 'Bearer ' + tokenStore, 'X-API-Key': tokenApi } });
      return response.data.data.username;
    } catch (error) {
      console.log(error)
    }
  }

  async function getAllData(picture_id) {
    try {
      const response = await axios.get('https://snapchat.epidoc.eu/snap/' + picture_id, { headers: { 'Authorization': 'Bearer ' + tokenStore, 'X-API-Key': tokenApi } });
      let duration = response.data.data.duration;
      let image = response.data.data.image;
      return { image, duration };
    } catch (error) {
      console.log(error);
    }
  }

  async function getSnapViewed(picture_id){
    try {
      const reponse = await fetch("https://snapchat.epidoc.eu/snap/seen/" + picture_id, {
        method: "PUT",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json",
          "Authorization": "Bearer " + tokenStore,
          'X-API-Key': tokenApi
        },
      });
      const data = await reponse.json();
    } catch (error) {
      console.log(error);
    }
  }

  function reload() {
    setCount(count + 1);
  }

  function openSnap(imageStore, duration, picture_id) {
    if (timer) {
      clearTimeout(timer);
    }

    setImage(imageStore);
    setTimerSnap(duration);

    const cooldown = setInterval(() => {
      // console.log(duration)
      if (duration >= 1) {
        setTimerSnap(prevTimerSnap => prevTimerSnap - 1);
      } else {
        setTimerSnap(null);
        clearInterval(cooldown);
      }
    }, 1000);

    setTimerCooldown(cooldown)

    const newTimer = setTimeout(() => {
      setImage(null);
      setTimer(null);
      setTimerSnap(null);
    }, duration * 1000);

    setTimer(newTimer);
    getSnapViewed(picture_id);

    reload()
  }

  const clearPicture = () => {
    if (timer) {
      clearTimeout(timer);
    }
    setImage(null);
    setTimer(null);
    setTimerSnap(null);
    clearInterval(timerCooldown);
    reload()
  };

  const renderItem = ({ item }) => {
    const backgroundColor = item.id === selectedId ? '#6e3b6e' : '#f9c2ff';
    const color = item.id === selectedId ? 'white' : 'black';

    return (
      <TouchableOpacity onPress={() => openSnap(item.picture, item.duration, item.id)} style={[styles.item, { backgroundColor }]}>
        <Text style={[styles.username, { color }]}>
          {item.username}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="black" />
        <Text>Loading ...</Text>
      </View>
    );
  }

  return (
    <GestureRecognizer onSwipeLeft={() => { router.replace('/(tabs)'); }} onSwipeRight={() => { router.replace('/map') }} onSwipeDown={() => { reload(); }} style={styles.container}>
      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.FlatList}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style = {{backgroundColor : "#FFC0CB",padding: 10,borderRadius: 100}}>There is no snap, try to refresh ↓</Text>
          </View>
        )}
      />
      {image &&
        <View>
          <TouchableOpacity onPress={() => clearPicture()}>
            <Image source={{ uri: image }} style={styles.image} />
            <Text style={styles.timeSnap}>{timerSnap}</Text>
          </TouchableOpacity>
        </View>
      }
    </GestureRecognizer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginTop: '10%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerimage: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: '0%',
    marginBottom: 10,
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  textButton: {
    fontSize: 20,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  username: {
    fontSize: 20,
    textAlign: 'center',
  },
  FlatList: {
    flex: 1,
    marginBottom: '10%',
  },
  image: {
    width: "100%",
    height: "100%",
  },
  timeSnap: {
    position: "absolute",
    top: 20,
    right: 20,
    color: "red",
    fontWeight: "400",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  }
});
