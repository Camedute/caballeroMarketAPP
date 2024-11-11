import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { registerUser, handleAuthError } from '../backend/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <SafeAreaView style={{flex: 1}} >
    <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.gradient}>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Registrarse</Text>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: 'center',
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
  backButtonText: {
    fontSize: 16,
    color: '#6a11cb',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  title: {
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
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  registerButton: {
    backgroundColor: '#6a11cb',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default Register;
