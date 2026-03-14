import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import NotesScreen from '../screens/NotesScreen';
import CreateNoteScreen from '../screens/CreateNoteScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useAuth } from '../context/AuthContext';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Notes: undefined;
  CreateNote: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Notes" component={NotesScreen} />
          <Stack.Screen name="CreateNote" component={CreateNoteScreen} options={{ title: 'Create Note' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;

