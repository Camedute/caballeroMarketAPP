import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../backend/firebase';

const Login = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico y una contraseña.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      await AsyncStorage.setItem('userToken', 'logged_in');
      navigation.navigate('Home');
    } catch (error: any) {
      const errorMsj = error.message;
      if (errorMsj === "Firebase: Error (auth/invalid-email).") {
        Alert.alert("Error", "Por favor, ingrese un correo válido");
      } else if (errorMsj === "Firebase: Error (auth/invalid-credential).") {
        Alert.alert("Error", "Credenciales inválidas, por favor, revise sus datos");
      } else {
        Alert.alert("Error", "Ha ocurrido un error.");
      }
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/Negocio.jpg')}
      style={styles.backgroundImage}
      imageStyle={{ opacity: 0.3 }}
    >
      <LinearGradient colors={['#00c6ff', '#0072ff']} style={styles.gradient}>
        <View style={styles.loginBox}>
          <Text style={styles.logoText}>CaballeroMarket</Text>
          
          <Text style={styles.title}>Ingresar Sesión</Text>
          
          <TextInput
            placeholder="Correo electrónico✉️"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            placeholder="Contraseña🙊"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Iniciar Sesión🚪</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('resetPassword')}>
            <Text style={styles.registerText}>¿Se te olvidó la contraseña? Recuperala acá🥲</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>¿No tienes cuenta? Regístrate✍️</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBox: {
    width: '90%',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  logoText: {
    fontSize: 34,
    fontWeight: '700',
    color: '#0072ff',
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  loginButton: {
    backgroundColor: '#0072ff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerText: {
    color: '#0072ff',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
});

export default Login;