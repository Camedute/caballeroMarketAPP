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


  const handleRegisterReset = async (id: string) => {

    if(id == "register"){
      console.log("register");
      navigation.navigate("Register");
    } else if(id == "reset"){
      console.log("reset");
      navigation.navigate('reset');
    }

  };

  return (
    <ImageBackground
      source={require('../../assets/abarrotes.jpg')}
      style={styles.background}
      imageStyle={{ resizeMode: 'cover' }}  // Asegura que la imagen se estire
    >
      <LinearGradient
        colors={['rgba(0, 198, 255, 0.7)', 'rgba(0, 114, 255, 0.7)']}
        style={styles.gradient}
      >
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

          <TouchableOpacity onPress={() => handleRegisterReset("reset")}>
            <Text style={styles.registerText}>¿Se te olvidó la contraseña? Recuperala acá🥲</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleRegisterReset("register")}>
            <Text style={styles.registerText}>¿No tienes cuenta? Regístrate✍️</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,  // Asegura que la imagen cubra toda la pantalla
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loginBox: {
    width: '80%',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',  // Añadir transparencia
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
