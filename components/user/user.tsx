import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const User = ({navigation}: any) => {
  const [cart, setCart] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    correoUsuario: '',
  });
  const [loading, setLoading] = useState(true); // Estado de carga

  const viewCart = () => {
    navigation.navigate('Cart', { cart });
  };

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
  

  // Función para obtener los datos del usuario desde Firestore
  const fetchUserData = async () => {
    if (user) {
      const userDocRef = doc(firestore, 'Clientes', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setFormData({
          nombreUsuario: userData.nombreUsuario || '',
          correoUsuario: userData.correoUsuario || '',
        });
      } else {
        console.log('No se encontraron datos del usuario');
      }
      setLoading(false); // Cambiar a false cuando los datos sean cargados
    }
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
        const userDocRef = doc(firestore, 'Clientes', user?.uid);
        await updateDoc(userDocRef, {
          nombreUsuario: formData.nombreUsuario,
        });
        Alert.alert('Actualización exitosa', 'Los datos del perfil han sido actualizados');
      } catch (error) {
        console.log('Error al actualizar los datos:', error);
        Alert.alert('Error', 'Hubo un problema al actualizar los datos');
      }
    }
    setIsEditing(!isEditing); // Alterna entre edición y vista
  };

  return (
    <View style={styles.container}>
      <Button title="salir"onPress={handleLogout} />
      {loading ? (
        // Mostrar el indicador de carga
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <View style={styles.card}>
          <View style={styles.profileImageContainer}>
            <Image style={styles.profileImage} />
          </View>

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
              <Text style={styles.text}>{formData.correoUsuario}</Text>
            </View>

            <Button
              title={isEditing ? 'Guardar' : 'Editar'}
              onPress={handleEditClick}
              color="#007bff"
            />
          </View>
        </View>
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={30} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('QRScanner')}>
          <Ionicons name="qr-code-outline" size={30} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={30} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={viewCart}>
          <Ionicons name="cart-outline" size={30} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '90%',
    borderRadius: 15,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  profileImageContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#007bff',
  },
  profileDetails: {
    width: '100%',
  },
  profileField: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    fontSize: 15,
  },
  text: {
    fontSize: 16,
    color: '#555',
  },
  bottomNav: {
    position: 'absolute', // Fija el navbar en la parte inferior
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    height: 60, // Ajusta el tamaño del navbar
  },
  container: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 70, // Asegura que el contenido no se superponga con el navbar
    backgroundColor: '#0072ff',
    justifyContent: 'center', // Alinea el contenido en la parte superior
    alignItems: 'center', // Centra el contenido horizontalmente
  },
});

export default User;
