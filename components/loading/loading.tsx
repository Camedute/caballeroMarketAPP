import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../backend/firebase';

const AuthLoadingScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkUser = async () => {
      onAuthStateChanged(auth, async (user) => {
        const token = await AsyncStorage.getItem('userToken');
        
        // Si el usuario está autenticado en Firebase y el token existe, redirige al Home
        if (user && token) {
          navigation.replace('Home');
        } else {
          // De lo contrario, redirige al Login
          navigation.replace('Login');
        }
      });
    };

    checkUser();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0072ff" />
    </View>
  );
};

export default AuthLoadingScreen;
