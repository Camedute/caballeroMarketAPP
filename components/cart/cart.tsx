import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView, Button } from 'react-native';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, where, query, updateDoc, getDoc, doc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { firebaseConfig } from '../backend/credenciales';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { useCart } from './cartContext';

// Definimos el tipo de producto en el carrito
type CartItem = {
  idProducto: string;
  nombreProducto: string;
  cantidadProducto: number;
  precioProducto: number;
  categoria: string;
  imagen: string;
  idDueno: string;
};


type CartProps = {
  route: {
    params: {
      cart: { [productId: string]: CartItem };
    };
  };
  navigation: any;
};


  const Cart = ({ navigation }: CartProps) => {
    const [tipoPago, setTipoPago] = useState<string>('efectivo');
    const { cart, clearCart } = useCart(); // Extraer el carrito y la función para limpiar el carrito
    console.log(cart);
  
    const firestore = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;


    const calculateTotal = () => {
      return Object.values(cart).reduce((total, product) => {
        return total + product.precio * product.cantidad; // Sumar el precio * cantidad de cada producto
      }, 0);
    };

    const total = calculateTotal();
  
    const handleCart = async () => {
      if (Object.keys(cart).length === 0) {
        Alert.alert('Error', 'No has agregado productos al carrito.');
        return;
      }
    
      const firestore = getFirestore();
      const auth = getAuth();
      const user = auth.currentUser;
    
      // Crear un array de productos para el pedido
      const listaPedidos = Object.values(cart).map((item) => ({
        idProducto: item.id,
        nombreProducto: item.nombreProducto,
        cantidadProducto: item.cantidad,
        precioProducto: item.precio,
        categoria: item.categoria,
        idDueno: item.idDueno,
      }));
    
      // Calcular el total
      const total = Object.values(cart).reduce((sum, item) => {
        return sum + item.precio * item.cantidad;
      }, 0);
    
      // Crear objeto de datos a enviar
      const pedidoData = {
        idCliente: user?.uid,
        idDueno: Object.values(cart)[0]?.idDueno,
        listaPedidos: listaPedidos,
        metodoPago: tipoPago,
        fecha: new Date(),
        total: total, // **Agregar el total aquí**
        realizado: false,
      };
    
      try {
        const pedidoRef = collection(firestore, 'Pedidos');
        await addDoc(pedidoRef, pedidoData);
    
        const idDueno = Object.values(cart)[0]?.idDueno;
        const inventarioRef = doc(firestore, 'Inventario', idDueno);
    
        // Obtener el documento del inventario del dueño
        const inventarioSnapshot = await getDoc(inventarioRef);
    
        if (!inventarioSnapshot.exists()) {
          Alert.alert('Error', 'Inventario no encontrado.');
          return;
        }
    
        // Datos del inventario
        const inventarioData = inventarioSnapshot.data();
        const productos = inventarioData.productos || [];
    
        // Iterar sobre los productos del carrito para actualizar el inventario
        for (const item of Object.values(cart)) {
          const idProducto = item.id;
          const cantidadPedido = item.cantidad;
    
          // Buscar el producto en el array de productos del inventario
          let productoEncontrado = false;
    
          for (let i = 0; i < productos.length; i++) {
            const producto = productos[i];
    
            if (producto.id === idProducto) {
              // Producto encontrado
              const cantidadDisponible = parseInt(producto.cantidadProducto);
              const nuevaCantidad = cantidadDisponible - cantidadPedido;
    
              if (nuevaCantidad >= 0) {
                // Actualizar la cantidad en el array
                productos[i].cantidadProducto = nuevaCantidad.toString();
    
                // Guardar los cambios en Firestore
                await updateDoc(inventarioRef, { productos });
                productoEncontrado = true;
                console.log(`Cantidad actualizada para producto ID ${idProducto}: ${nuevaCantidad}`);
              } else {
                Alert.alert(
                  'Error',
                  `La cantidad solicitada para el producto ${producto.nombreProducto} excede el inventario disponible.`
                );
                return;
              }
    
              break; // Salir del bucle una vez encontrado el producto
            }
          }
    
          if (!productoEncontrado) {
            console.log(`Producto con id ${idProducto} no encontrado en el inventario.`);
          }
        }
    
        Alert.alert('Pedido enviado exitosamente.');
        clearCart();
        navigation.navigate('Home');
      } catch (error: any) {
        console.error('Error al enviar el pedido y actualizar el inventario:', error.message);
        Alert.alert('Error', 'Hubo un problema al enviar el pedido.');
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
                              <Text style={styles.productText}>{product.nombreProducto}</Text>
                              <Text style={styles.productText}>Cantidad: {product.cantidad}</Text>
                              <Text style={styles.productText}>precio: ${product.precio}</Text>
                             {/* <Button title='Editar Cantidad'></Button>
                              <Button title='borrar'></Button> */}
                            </View>
                          )}
                        />
                  )}
                </View>

                {Object.keys(cart).length > 0 && (
                <View style={styles.totalSection}>
                  <Text style={styles.totalText}>Total: ${total}</Text>
                </View>
              )}

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
          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
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
  totalSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default Cart;
