import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity, ImageBackground } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../backend/firebase';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const navigation = useNavigation();

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
    <ImageBackground 
      source={require('../../assets/abarrotes.jpg')} // O usa {uri: 'URL_DE_LA_IMAGEN'}
      style={styles.container}
    >
      <LinearGradient colors={['rgba(0, 198, 255, 0.7)', 'rgba(0, 114, 255, 0.7)']} style={styles.gradient}>
        {/* Botón de volver */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>Restablecer Contraseña</Text>

          <TextInput
            style={styles.input}
            placeholder="Correo Electrónico✉️"
            placeholderTextColor="#888"
            value={email}
            onChangeText={(text) => setEmail(text)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.infoText}>
            Ingresarás tu correo y recibirás un enlace para restablecer tu contraseña.
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Restablecer Contraseña</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
  },
  card: {
    width: '85%',
    padding: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#0072ff',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },
  infoText: {
    color: '#333',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0072ff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff4d4d',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  successText: {
    color: '#00cc66',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ResetPassword;
