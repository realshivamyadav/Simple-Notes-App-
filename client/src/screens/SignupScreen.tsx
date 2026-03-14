import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Signup'>;

const SignupScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { signup } = useAuth();
  const navigation = useNavigation<SignupScreenNavigationProp>();

  const handleSignup = async () => {
    try {
      await signup(username, password);
      Alert.alert('Signup Successful', 'You can now log in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      Alert.alert('Signup Failed', 'That username might already be taken.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignup} />
      <View style={styles.separator} />
      <Button title="Back to Login" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  separator: {
    marginVertical: 10,
  },
});

export default SignupScreen;
