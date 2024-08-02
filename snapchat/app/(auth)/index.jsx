import { StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import GestureRecognizer from 'react-native-swipe-gestures';
import { useState, useEffect, useLayoutEffect } from 'react';

export default function Conctact() {
  const [token, setToken] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function getToken() {
      const tokenStore = await SecureStore.getItemAsync("token");
      setToken(tokenStore);
    }
    getToken();
  }, []);

  useLayoutEffect(() => {
    if (token) {
      router.replace("/(tabs)");
    }
  }, [token]);

  return (
    <GestureRecognizer
      onSwipeLeft={()=>{router.replace('/(tabs)')}}
      style={styles.Container}
      >
        <Text>Welcome to Snapchat</Text>
    </GestureRecognizer>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
