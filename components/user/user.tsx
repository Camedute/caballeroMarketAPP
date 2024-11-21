import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const User = ({ navigation }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    correoUsuario: '',
    descripcion: '',
  });
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const firestore = getFirestore();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('userToken');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'Hubo un problema al cerrar sesión');
    }
  };

  const fetchUserData = async () => {
    if (user && user.uid) {
      try {
        const userDocRef = doc(firestore, 'Clientes', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            nombreUsuario: userData.nombreUsuario || '',
            correoUsuario: userData.correoUsuario || '',
            descripcion: userData.descripcion || '',
          });
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      }
    } else {
      console.log('El usuario no está autenticado');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleInputChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleEditClick = async () => {
    if (isEditing) {
      try {
        if (user && user.uid) {
          const userDocRef = doc(firestore, 'Clientes', user.uid);
          await updateDoc(userDocRef, {
            nombreUsuario: formData.nombreUsuario,
            correoUsuario: formData.correoUsuario,
            descripcion: formData.descripcion,
          });
          Alert.alert('Actualización exitosa', 'Los datos del perfil han sido actualizados');
        }
      } catch (error) {
        console.log('Error al actualizar los datos:', error);
        Alert.alert('Error', 'Hubo un problema al actualizar los datos');
      }
    }
    setIsEditing(!isEditing);
  };

  const viewCart = () => {
    try {
      navigation.navigate('Cart'); // Aseguramos que la navegación esté correctamente definida.
    } catch (error) {
      console.error('Error al navegar a Cart:', error);
      Alert.alert('Error', 'No se pudo acceder al carrito');
    }
  };

  return (
    <LinearGradient
      colors={['#0099FF', '#66CCFF']}
      style={styles.container}
    >
      {/* Botón de cerrar sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Card de perfil centrado */}
      <View style={styles.centerContent}>
        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <>
              <Image
                source={require('../../assets/profile.jpg')}
                style={styles.profileImage}
              />
              <View style={styles.profileDetails}>
                <View style={styles.profileField}>
                  <Text style={styles.label}>Nombre:</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.input}
                      value={formData.nombreUsuario}
                      onChangeText={(text) => handleInputChange('nombreUsuario', text)}
                    />
                  ) : (
                    <Text style={styles.text}>{formData.nombreUsuario}</Text>
                  )}
                </View>

                <View style={styles.profileField}>
                  <Text style={styles.label}>Email:</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.input}
                      value={formData.correoUsuario}
                      onChangeText={(text) => handleInputChange('correoUsuario', text)}
                    />
                  ) : (
                    <Text style={styles.text}>{formData.correoUsuario}</Text>
                  )}
                </View>
                  {/*
                <View style={styles.profileField}>
                  <Text style={styles.label}>Descripción:</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.input}
                      value={formData.descripcion}
                      onChangeText={(text) => handleInputChange('descripcion', text)}
                    />
                  ) : (
                    <Text style={styles.text}>{formData.descripcion}</Text>
                  )}
                </View>
                    */}
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEditClick}
                >
                  <Text style={styles.editButtonText}>{isEditing ? 'Guardar' : 'Editar'}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Navbar inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={30} color="#0072ff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('QRScanner')}>
          <Ionicons name="qr-code-outline" size={30} color="#0072ff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={30} color="#0072ff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={viewCart}>
          <Ionicons name="cart-outline" size={30} color="#0072ff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#ff5252',
    padding: 10,
    borderRadius: 50,
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
  profileDetails: {},
  profileField: {
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  text: {
    color: '#555',
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  editButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    elevation: 5,
  },
});

export default User;
