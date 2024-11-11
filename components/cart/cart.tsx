import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, FlatList, TouchableOpacity, Alert } from 'react-native';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { firebaseConfig } from '../constants';
import { SafeAreaView } from 'react-native-safe-area-context';

// Definición de tipos
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

const Cart = ({ route, navigation }: CartProps) => {
  const [cartGo, setCartGo] = useState({});
  const [tipoPago, setTipoPago] = useState<string>('efectivo');
  const { cart } = route.params;

  if (getApps().length === 0) {
    initializeApp(firebaseConfig);
  }

  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const viewCart = () => {
    navigation.navigate('Cart', { cartGo });
  };
  
  const handleCart = async () => {
    if (Object.entries(cart).length <= 0){
      Alert.alert('Error','No has agregado productos al carrito.');
    } else {
      try {
        const pedidoRef = collection(firestore, 'Pedidos');
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
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
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
          contentContainerStyle={styles.productList}
          renderItem={({ item: [productId, product] }) => (
            <View style={styles.productCard}>
              <Text style={styles.productText}>Producto: {product.nombre}</Text>
              <Text style={styles.productText}>Cantidad: {product.cantidad}</Text>
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
    </SafeAreaView>
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
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  productList: {
    paddingBottom: 100,
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
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
});

export default Cart;
