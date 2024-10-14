import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { initializeApp, getApps } from 'firebase/app';  // Firebase desde el SDK de JS
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Componente de Login
const Login = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Configuración de Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyCgdRUxu9pGXCWhGCLUgXNPRO55HKNEOMg",
    authDomain: "caballeromarket-fb883.firebaseapp.com",
    projectId: "caballeromarket-fb883",
    storageBucket: "caballeromarket-fb883.appspot.com",
    messagingSenderId: "109605544020",
    appId: "1:109605544020:web:ef11c0f0e2f11af4a6cdc1",
    measurementId: "G-RZ9MM0TNMH"
  };

  // Inicializar Firebase si aún no ha sido inicializado
  if (getApps().length === 0) {
    initializeApp(firebaseConfig);
  }

  const auth = getAuth();

  // Función para manejar el login
  const handleLogin = async () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico y una contraseña.');
      return;
    }

    try {
      // Intento de inicio de sesión con Firebase Authentication
      await signInWithEmailAndPassword(auth, email, password);
      await AsyncStorage.setItem('userToken', 'logged_in');  // Guardar token en AsyncStorage
      navigation.navigate('Home');  // Navegar al Home si el login es exitoso
    } catch (error: any) {
      console.log(error.message);
      const errorMsj = error.message;
      if (errorMsj ===  "Firebase: Error (auth/invalid-email)."){
        Alert.alert("error","Por favor, ingrese un correo válido");
      } else if (errorMsj === "Firebase: Error (auth/invalid-credential)."){
        Alert.alert("error","Credenciales inválidas, por favor, revise sus datos");
      } else{Alert.alert("error","Ha ocurrido un error.")}
    }
  };

  return (
    <LinearGradient colors={['#00c6ff', '#0072ff']} style={styles.gradient}>
      <View style={styles.loginBox}>
        <Text style={styles.title}>Login</Text>
        
        <TextInput
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBox: {
    width: '90%',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10, 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  loginButton: {
    backgroundColor: '#0072ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
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
