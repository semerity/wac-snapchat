import { StyleSheet, View, Text, Button, TextInput, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import GestureRecognizer from 'react-native-swipe-gestures';
import { useState, useEffect } from 'react';
import * as SecureStore from "expo-secure-store";
import axios from 'axios';
import { tokenApi } from "../../conf.json";

export default function TabTwoScreen() {
  const email = SecureStore.getItem("email")
  const username = SecureStore.getItem("username")
  const profilPicture = SecureStore.getItem("profilPicture")
  const tokenStore = SecureStore.getItem("token")
  const password = SecureStore.getItem("password")

  const [emailInput, setEmailInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [profilPictureInput, setProfilPictureInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [password2Input, setPassword2Input] = useState("");

  const router = useRouter();

  async function deleteToken() {
    await SecureStore.deleteItemAsync("email");
    await SecureStore.deleteItemAsync("username");
    await SecureStore.deleteItemAsync("profilPicture");
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("password");
    router.replace("/connection");
  }

  async function deleteAll() {
    await SecureStore.deleteItemAsync("email");
    await SecureStore.deleteItemAsync("username");
    await SecureStore.deleteItemAsync("profilPicture");
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("password");
    router.replace("/inscription");
  }

  async function reconect() {
    await SecureStore.deleteItemAsync("email");
    await SecureStore.deleteItemAsync("username");
    await SecureStore.deleteItemAsync("profilPicture");
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("password");
  }

  async function save(key, value) {
    await SecureStore.setItemAsync(key, value);
  }

  function deleteAlert(){
    Alert.alert('Delete Account', 'Are you sure you want to delete your account ?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {text: 'Delete', onPress: (deleteAccount)},
    ]);
  }

  async function deleteAccount() {
    try {
      const reponse = await axios.delete('https://snapchat.epidoc.eu/user',{
        headers: {
          'accept': 'application/json',
          'X-API-Key': tokenApi,
          'Authorization': 'Bearer ' + tokenStore,
        }
      })
      deleteAll()
    } catch (error) {
      console.log("Error delete account")
    }

  }

  async function handleUpdate() {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    const emailChange = emailInput || email
    const usernameChange = usernameInput || username
    const profilPictureChange = profilPictureInput || profilPicture
    const passwordChange = passwordInput || password
    const password2Change = password2Input || password

    if (reg.test(emailChange)) {
      if (passwordChange == password2Change) {
        try {
          const reponse = await axios.patch('https://snapchat.epidoc.eu/user', {
            email: emailChange,
            username: usernameChange,
            profilePicture: profilPictureChange,
            password: passwordChange
          },{
            headers: {
              'X-API-Key': tokenApi,
              'Authorization': 'Bearer ' + tokenStore,
            }
          })
        } catch (error) {
          console.log("Error request")
        }

        reconect();

        try {
          const reponse = await axios.put('https://snapchat.epidoc.eu/user', {
            email: emailChange,
            password: passwordChange,
          },{
            headers: {
              'X-API-Key': tokenApi
            }
          })

          if (reponse.status === 200 ) {
            let getEmail = reponse.data.data.email
            let getUsername = reponse.data.data.username
            let getProfilPicture= reponse.data.data.profilePicture
            let getToken = reponse.data.data.token
            save("email", getEmail);
            save("username", getUsername);
            save("profilPicture", getProfilPicture);
            save("token", getToken);
            save("password", passwordChange);
            router.replace("/(tabs)")
          }
        } catch (error) {
          alert(error);
        }
      }else{
        alert("Password doesn't match")
      }
    }else{
      alert("Your email is not valid")
    }

  }

  return (
    <GestureRecognizer onSwipeRight={() => { router.replace('/contact') }} style={styles.container}>
      <View style={styles.container_two}>
        <Text style={styles.header}>Profil</Text>
        <TextInput
          style={styles.input}
          placeholder={email}
          clearButtonMode="always"
          onChangeText={setEmailInput}
        />
        <TextInput
          style={styles.input}
          placeholder={username}
          clearButtonMode="always"
          onChangeText={setUsernameInput}
        />
        <TextInput
          style={styles.input}
          placeholder="Put the link of your image base64"
          clearButtonMode="always"
          onChangeText={setProfilPictureInput}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={true}
          clearButtonMode="always"
          onChangeText={setPasswordInput}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry={true}
          clearButtonMode="always"
          onChangeText={setPassword2Input}
        />

        <Button title="Update" onPress={handleUpdate} />

        <View style={styles.disconnect}>
          <Button title='Disconnect' onPress={deleteToken} color={"red"} />
        </View>
        <View style={styles.disconnect}>
          <Button title='Delete Your account' onPress={deleteAlert} color={"red"} />
        </View>
      </View>
    </GestureRecognizer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  container_two: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  disconnect: {
    marginTop: 20,
    color: "red",
  },
});
