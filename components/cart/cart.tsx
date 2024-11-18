import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView } from 'react-native';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { firebaseConfig } from '../backend/credenciales';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { useCart } from './cartContext';

type CartItem = {
  nombre: string;
  cantidad: number;
};

type CartProps = {
  route: {
    params: {
      cart: { [productId: string]: CartItem };
    };
  };
  navigation: any;
};

const Cart = ({ navigation }: { navigation: any }) => {
  const [tipoPago, setTipoPago] = useState<string>('efectivo');
  const { cart, clearCart } = useCart(); // Extraer el carrito y la función para limpiar el carrito
  console.log(cart);

  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const viewCart = () => {
    navigation.navigate('Cart', { cart });
  };

  const handleCart = async () => {
    if (Object.keys(cart).length === 0) {
      Alert.alert('Error', 'No has agregado productos al carrito.');
    } else {
      try {
        const pedidoRef = collection(firestore, 'Pedidos');
        await addDoc(pedidoRef, {
          listaPedidos: cart,
          idCliente: user?.uid,
          metodoPago: tipoPago,
          fecha: new Date(),
          realizado: false,
        });
        Alert.alert('Pedido enviado correctamente');
        clearCart(); // Limpiar el carrito después de enviar el pedido
        navigation.navigate('Home');
      } catch (error: any) {
        console.log('Error al enviar el pedido:', error.message);
      }
    }
  };


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <LinearGradient colors={['#0099FF', '#66CCFF']} style={styles.gradientBackground}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
              {/* Título */}
              <Text style={styles.title}>¡Completa tu Compra!</Text>

              {/* Botón de Volver (posicionado correctamente) */}
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#007bff" />
              </TouchableOpacity>
              {/* Productos en el Carrito */}
                <View style={styles.cartSection}>
                  <Text style={styles.sectionTitle}>Productos en el Carrito</Text>
                  {Object.keys(cart).length === 0 ? (
                    <Text>No hay productos en el carrito.</Text>
                  ) : (
                    <FlatList
                          data={Object.entries(cart)}
                          keyExtractor={([productId]) => productId}
                          contentContainerStyle={styles.productList}
                          renderItem={({ item: [productId, product] }) => (
                            <View style={styles.productCard}>
                              <Text style={styles.productText}>Producto: {product.nombreProducto}</Text>
                              <Text style={styles.productText}>Cantidad: {product.cantidad}</Text>
                            </View>
                          )}
                        />
                  )}
                </View>
              {/* Método de pago */}
              <View style={styles.paymentSection}>
                <Text style={styles.paymentLabel}>Método de pago:</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={tipoPago}
                    onValueChange={(itemValue) => setTipoPago(itemValue)}
                    style={styles.picker}
                    mode="dropdown"
                  >
                    <Picker.Item label="Efectivo" value="efectivo" />
                    <Picker.Item label="Débito" value="debito" />
                    <Picker.Item label="Crédito" value="credito" />
                  </Picker>
                </View>
              </View>

              {/* Botón de Solicitar Pedido */}
              <TouchableOpacity style={styles.orderButton} onPress={handleCart}>
                <Text style={styles.orderButtonText}>Solicitar Pedido</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>

        {/* Barra de Navegación Inferior */}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    paddingBottom: 60, // Para asegurarse de que el contenido no se superponga al navbar inferior
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 120, // Ajusté el espaciado superior para bajar todos los elementos más abajo
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    elevation: 2,
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  cartSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  productList: {
    paddingBottom: 100,
  },
  productCard: {
    backgroundColor: '#FFEB3B', // Color llamativo de fondo
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  productText: {
    fontSize: 16,
    color: '#333',
  },
  paymentSection: {
    marginBottom: 30,
  },
  paymentLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  picker: {
    height: 50,
    width: '100%',
    fontSize: 16,
    color: '#333',
  },
  orderButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#007bff',
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    width: '100%',
  },
});

export default Cart;
