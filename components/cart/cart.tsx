import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, FlatList, TouchableOpacity } from 'react-native';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore'; // Cambia a addDoc para que Firestore genere el ID
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { firebaseConfig } from '../constants';

const Cart = ({ route, navigation } : any) => {
  const [tipoPago, setTipoPago] = useState<string>('efectivo');
  const { cart } = route.params; // Recibe el carrito y el id del cliente desde la ruta

  

  if (getApps().length === 0) {
    initializeApp(firebaseConfig);
  }

  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  
  const handleCart = async () => {
    try {
      const pedidoRef = collection(firestore, 'Pedidos'); // Referencia a la colección 'Pedidos'
      await addDoc(pedidoRef, {
        listaPedidos: cart,
        idCliente: user?.uid,
        metodoPago: tipoPago,
        fecha: new Date(),
        realizado: false
      });
      Alert.alert('Pedido enviado correctamente');
      navigation.navigate('Home');
    } catch (error: any) {
      console.log('Error al enviar el pedido:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Botón de Volver */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#007bff" />
      </TouchableOpacity>

      <Text style={styles.title}>Productos en el Carrito</Text>
      
      {Object.keys(cart).length === 0 ? (
        <Text>No hay productos en el carrito.</Text>
      ) : (
        <FlatList
          data={Object.entries(cart)}
          keyExtractor={([productId]) => productId}
          contentContainerStyle={styles.productList} // Añadido para controlar el espacio
          renderItem={({ item: [productId, cantidad] }) => (
            <View style={styles.productCard}>
              <Text style={styles.productText}>Producto ID: {productId}</Text>
              <Text style={styles.productText}>Cantidad: {cantidad}</Text>
            </View>
          )}
        />
      )}

      <View style={styles.paymentOptions}>
        <Text>Seleccione método de pago:</Text>
        <TouchableOpacity onPress={() => setTipoPago('efectivo')}>
          <Text style={[styles.paymentButton, tipoPago === 'efectivo' && styles.selectedPayment]}>Efectivo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTipoPago('debito')}>
          <Text style={[styles.paymentButton, tipoPago === 'debito' && styles.selectedPayment]}>Débito</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTipoPago('credito')}>
          <Text style={[styles.paymentButton, tipoPago === 'credito' && styles.selectedPayment]}>Crédito</Text>
        </TouchableOpacity>
      </View>

      <Button title="Solicitar Pedido" onPress={handleCart} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    elevation: 2, // Para dar sombra en Android
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  productList: {
    paddingBottom: 100, // Espacio inferior para evitar que el contenido se superponga con el botón
  },
  productCard: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productText: {
    fontSize: 16,
  },
  paymentOptions: {
    marginTop: 20,
    marginBottom: 20,
  },
  paymentButton: {
    padding: 10,
    marginVertical: 5,
    textAlign: 'center',
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  selectedPayment: {
    backgroundColor: '#007bff',
    color: '#fff',
  },
});

export default Cart;
