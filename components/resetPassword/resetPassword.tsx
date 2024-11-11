import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../backend/firebase';
import { useNavigation } from '@react-navigation/native'; // Importa el hook de navegación

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const navigation = useNavigation(); // Hook para la navegación

  // Función para manejar el restablecimiento de contraseña
  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Por favor, ingresa tu correo electrónico.');
      Alert.alert('Error', 'Por favor, ingresa tu correo electrónico.');
      return;
    }

    setError('');
    setSuccess('');

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('¡Enlace enviado correctamente!');
      Alert.alert(
        'Éxito',
        '¡Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'), // Redirige a la pantalla de Login
          },
        ]
      );
    } catch (err: any) {
      console.error('Error al enviar el correo:', err);
      if (err.code === 'auth/invalid-email') {
        setError('Correo electrónico no válido.');
        Alert.alert('Error', 'Correo electrónico no válido.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No se encontró una cuenta con ese correo.');
        Alert.alert('Error', 'No se encontró una cuenta con ese correo.');
      } else {
        setError('Ocurrió un error inesperado.');
        Alert.alert('Error', 'Ocurrió un error inesperado. Inténtalo más tarde.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restablecer Contraseña</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico✉️"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Restablecer Contraseña</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {success ? <Text style={styles.successText}>{success}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    fontSize: 14,
  },
  successText: {
    color: 'green',
    marginTop: 10,
    fontSize: 14,
  },
});

export default ResetPassword;
