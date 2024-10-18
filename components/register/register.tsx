import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '../constants';

const Register = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');



  if (getApps().length === 0) {
    initializeApp(firebaseConfig);
  }

  const auth = getAuth();
  const firestore = getFirestore();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, mail, password);
      const user = userCredential.user;

      const userDocRef = doc(firestore, 'Clientes', user.uid);
      await setDoc(userDocRef, {
        correoUsuario: user.email,
        nombreUsuario: username,
        uid: user.uid,
        fechaHoraCreacion: new Date()
      });

      Alert.alert('Registro exitoso', `Bienvenido ${username}`);
      navigation.navigate('Home');
    } catch (error: any) {
      console.log(error.message);
      const msjError = error.message;

      if (msjError === "Firebase: Error (auth/email-already-in-use).") {
        Alert.alert('Error', 'Correo Electrónico en uso');
      } else if (msjError === "Firebase: Password should be at least 6 characters (auth/weak-password).") {
        Alert.alert('Error', 'Su contraseña es muy insegura, considere utilizar al menos 6 caracteres');
      } else if(msjError === "Firebase: Error (auth/invalid-email)."){
        Alert.alert('Error','Por favor, ingrese un correo válido');
      } else if(msjError === "Firebase: Error (auth/missing-password)."){
        Alert.alert('Error','Por favor, ingrese una contraseña');
      } else {
        Alert.alert('Error', 'Problemas con la autenticación');
      }
    }
  };

  return (
    <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.gradient}>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Registrarse</Text>

          <TextInput
            placeholder="Nombre de usuario"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Correo Electrónico"
            value={mail}
            onChangeText={setMail}
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          <TextInput
            placeholder="Confirmar Contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
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
