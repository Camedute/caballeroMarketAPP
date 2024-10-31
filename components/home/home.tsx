// Home.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { handleStoresHome } from '../backend/firebase';

const Home = ({ navigation }: any) => {
  const [cart, setCart] = useState({});
  const [stores, setStores] = useState([]);

  useEffect(() => {
    const fetchStores = async () => {
      const storesData = await handleStoresHome();
      setStores(storesData);
    };
    fetchStores();
  }, []);

  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const currentCount = prevCart[product.id] || 0;
      return { ...prevCart, [product.id]: currentCount + 1 };
    });
  };

  const viewCart = () => {
    navigation.navigate('Cart', { cart });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tiendas y Productos</Text>
      <FlatList
        data={stores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.storeItem}>
            <Text style={styles.storeName}>{item.nombreLocal}</Text>
            <Text style={styles.storeOwner}>Dueño: {item.nombreUsuario}</Text>

            <FlatList
              data={item.productos}
              keyExtractor={(product) => product.id}
              renderItem={({ item: product }) => (
                <View style={styles.product}>
                  <Text style={styles.productName}>{product.nombreProducto}</Text>
                  <Text style={styles.productPrice}>${product.precioProducto}</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => addToCart(product)}
                  >
                    <Text style={styles.addButtonText}>Añadir al carrito</Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={<Text>No hay productos disponibles</Text>}
            />
          </View>
        )}
        ListEmptyComponent={<Text>No hay tiendas disponibles</Text>}
      />

      <TouchableOpacity style={styles.viewCartButton} onPress={viewCart}>
        <Text style={styles.viewCartButtonText}>Ver carrito</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  storeItem: { backgroundColor: '#eee', padding: 15, marginBottom: 10, borderRadius: 10 },
  storeName: { fontSize: 18, fontWeight: 'bold' },
  storeOwner: { fontSize: 16, color: '#666' },
  product: { backgroundColor: '#fff', padding: 10, marginTop: 10, borderRadius: 8 },
  productName: { fontSize: 16 },
  productPrice: { fontSize: 14, color: '#666', marginBottom: 5 },
  addButton: { backgroundColor: '#0072ff', padding: 8, borderRadius: 5, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  viewCartButton: { backgroundColor: '#ff6347', padding: 12, borderRadius: 5, marginTop: 20, alignItems: 'center' },
  viewCartButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default Home;
