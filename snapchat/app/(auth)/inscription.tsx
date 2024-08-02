import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { tokenApi } from "../../conf.json"

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter()

  const handleSignUp = async () => {
    if (email && username && password && confirmPassword) {
      if (password !== confirmPassword) {
        alert('Both of the password doesn\'t match');
        return;
      }

      try {
        const response = await axios.post('https://snapchat.epidoc.eu/user', {
          email,
          username,
          password,
        }, {
          headers: {
            'X-API-Key': tokenApi,
          }
        }
        );

        if (response.status === 200) {
          alert('Register Succeed');
          router.replace("/connection");
        }
      } catch (error) {
        alert('Error register');
      }
    } else {
      alert('Fill all the fields');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType='email-address'
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry={true}
        onChangeText={setConfirmPassword}
      />
      <Button title="Sign Up" onPress={handleSignUp} />
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

export default SignUp;
