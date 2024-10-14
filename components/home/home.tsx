import React, { useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity } from 'react-native';

const products = [
  { id: '1', name: 'Producto 1', price: 10 },
  { id: '2', name: 'Producto 2', price: 20 },
  { id: '3', name: 'Producto 3', price: 30 },
];

const Home = ({ navigation }) => {
  const [cart, setCart] = useState({}); // Guarda la cantidad de cada producto

  const addToCart = (product) => {
    setCart((prevCart) => {
      const currentCount = prevCart[product.id] || 0;
      return { ...prevCart, [product.id]: currentCount + 1 }; // Suma la cantidad
    });
  };

  const viewCart = () => {
    navigation.navigate('Cart', { cart });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de productos</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.product}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>${item.price}</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
              <Text style={styles.addButtonText}>Añadir al carrito</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity style={styles.viewCartButton} onPress={viewCart}>
        <Text style={styles.viewCartButtonText}>Ver carrito</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  product: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  productName: {
    fontSize: 18,
  },
  productPrice: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#0072ff',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  viewCartButton: {
    backgroundColor: '#ff6347',
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  viewCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Home;
