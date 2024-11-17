import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const User = ({ navigation }: any) => {
  const [cart, setCart] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    correoUsuario: '',
    descripcion: '', // Campo de descripción
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
        routes: [{ name: 'Login' }], // Redirige a la pantalla de Login
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'Hubo un problema al cerrar sesión');
    }
  };

  const fetchUserData = async () => {
    if (user) {
      const userDocRef = doc(firestore, 'Clientes', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setFormData({
          nombreUsuario: userData.nombreUsuario || '',
          correoUsuario: userData.correoUsuario || '',
          descripcion: userData.descripcion || '', // Traemos también la descripción
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
          descripcion: formData.descripcion, // Guardamos también la descripción
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
      {/* Imagen de fondo con gradiente */}
      <ImageBackground
        source={require('../../assets/abarrotes.jpg')} // Asegúrate de que la imagen esté en la carpeta correcta
        style={styles.imageBackground}
      >
        {/* Gradiente azul encima de la imagen de fondo */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 255, 0.5)']} // Colores del gradiente
          style={styles.imageGradient}
        />
      </ImageBackground>

      {/* Botón de Cerrar sesión, posicionado encima de la imagen de fondo */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Card para el perfil */}
      <View style={styles.cardContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <View style={styles.card}>
            <View style={styles.profileImageContainer}>
              <Image
                source={require('../../assets/profile.jpg')} // Asegúrate de que la imagen esté en la carpeta correcta
                style={styles.profileImage}
              />
            </View>

            <View style={styles.profileDetails}>
              {/* Nombre */}
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

              {/* Email */}
              <View style={styles.profileField}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.text}>{formData.correoUsuario}</Text>
              </View>

              {/* Descripción */}
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

              {/* Botón para editar o guardar */}
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditClick}
              >
                <Text style={styles.editButtonText}>{isEditing ? 'Guardar' : 'Editar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Barra de navegación inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={30} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('QRScanner')}>
          <Ionicons name="qr-code-outline" size={30} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={30} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={viewCart}>
          <Ionicons name="cart-outline" size={30} color="#007bff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0072ff',
  },
  imageBackground: {
    width: '100%',
    height: '40%', // Ajustamos la altura del fondo de la imagen
    position: 'absolute', // Usamos absolute para que no interfiera con el contenido
    top: 0,
    left: 0,
    zIndex: -1, // Esto asegura que la imagen de fondo no bloquee otros componentes
  },
  imageGradient: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 20,
    paddingRight: 20,
    width: '100%',
  },
  logoutButton: {
    backgroundColor: '#ff3b30', // Rojo
    padding: 10,
    borderRadius: 50,
    position: 'absolute', // Ajusta la posición del botón
    top: 40, // Posición ajustada para estar justo debajo del borde superior
    right: 20,
    zIndex: 10, // Aseguramos que esté por encima de la imagen de fondo
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center', // Centra el cuadro en la pantalla
    alignItems: 'center',
    marginTop: 80, // Ajuste para que el contenido no se superponga con el fondo
    zIndex: 1, // El cuadro debe estar encima del fondo
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center', // Alineamos el contenido al centro
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
    borderColor: '#0072ff',
  },
  profileDetails: {
    width: '100%',
    alignItems: 'center',
  },
  profileField: {
    marginBottom: 15,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    fontSize: 15,
    width: '100%',
  },
  text: {
    fontSize: 16,
    color: '#555',
  },
  editButton: {
    marginTop: 20,
    backgroundColor: '#0072ff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    height: 60,
    zIndex: 10, // Esto asegura que la barra de navegación esté por encima de otros elementos
  },
});

export default User;
