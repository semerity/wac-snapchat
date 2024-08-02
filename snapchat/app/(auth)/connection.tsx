import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import * as SecureStore from "expo-secure-store";
import { useRouter } from 'expo-router';
import { tokenApi } from "../../conf.json"


const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter()  

  async function save(key:string, value: string) {
    await SecureStore.setItemAsync(key, value);
  }

  async function getSecureStore(key: string) {
    let result = await SecureStore.getItemAsync(key);
    alert("result : " + result );
  }

  const handleSignIn = async () => {
    if (email && password) {
      try {
        const response = await axios.put('https://snapchat.epidoc.eu/user', {
          email,
          password,

        },{
          headers: {
            'X-API-Key': tokenApi
          }
        })

        if (response.status === 200 ) {
          let getEmail = response.data.data.email
          let getUsername = response.data.data.username
          let getProfilPicture= response.data.data.profilePicture
          let getToken = response.data.data.token
          save("email", getEmail);
          save("username", getUsername);
          save("profilPicture", getProfilPicture);
          save("token", getToken);
          save("password", password)
          router.replace("/(tabs)")
        }
      } catch (error) {
        alert('Error connexion');
      }
    } else {
      alert('You should put an email and a password');
    }
  };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign In</Text>
            <TextInput
                style={styles.input}
                keyboardType='email-address'
                placeholder="Email"
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry={true}
                onChangeText={setPassword}
            />
            <Button title="Sign In" onPress={handleSignIn} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    input: {
        width: 200,
        height: 40,
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
        backgroundColor: 'white',
    },
});

export default SignIn;
