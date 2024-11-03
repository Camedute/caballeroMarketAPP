import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const User = ({navigation}: any) => {
  const [cart, setCart] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    correoUsuario: '',
  });

  const viewCart = () => {
    navigation.navigate('Cart', { cart });
  };

  const auth = getAuth();
  const firestore = getFirestore();
  const user = auth.currentUser;

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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0072ff',
  },
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
});

export default User;
