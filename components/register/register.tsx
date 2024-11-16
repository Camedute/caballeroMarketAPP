import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { registerUser, handleAuthError } from '../backend/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ImageBackground } from 'react-native';

const Register = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    const result = await registerUser(mail, password, username);
    if (result.success) {
      Alert.alert('Registro exitoso', `Bienvenido ${username}`);
      navigation.navigate('Home');
    } else {
      handleAuthError(result.error);
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <ImageBackground
        source={require('../../assets/abarrotes.jpg')} // Ruta de la imagen en tu carpeta assets
        style={styles.background}
        imageStyle={{ resizeMode: 'cover' }}
      >
        <LinearGradient
          colors={['rgba(128, 0, 128, 0.5)', 'rgba(128, 0, 128, 0.5)']} // Difuminado morado
          style={styles.gradient}
        >
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#000000" />
          </TouchableOpacity>

          <View style={styles.container}>
            <View style={styles.card}>
              <Text style={styles.title}>CaballeroMarket</Text>
              <Text style={styles.subtitle}>Registrarse</Text>

              <TextInput
                placeholder="Nombre de usuario😺"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                autoCapitalize="none"
              />
              <TextInput
                placeholder="Correo Electrónico✉️"
                value={mail}
                onChangeText={setMail}
                style={styles.input}
                autoCapitalize="none"
              />
              <TextInput
                placeholder="Contraseña🙊"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
              <TextInput
                placeholder="Confirmar Contraseña🙈"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={styles.input}
              />

              <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                <Text style={styles.registerButtonText}>Registrarse✍️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
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
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Transparencia en el fondo
    borderRadius: 10,
    padding: 30,
    width: '100%',
    maxWidth: 500,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#800080', // Morado
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  registerButton: {
    backgroundColor: '#800080', // Morado
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Register;
