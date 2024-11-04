import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { handleStoresHome } from '../backend/firebase';
import { Ionicons } from '@expo/vector-icons';

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
      if (prevCart[product.id]) {
        return {
          ...prevCart,
          [product.id]: {
            ...prevCart[product.id],
            cantidad: prevCart[product.id].cantidad + 1,
          },
        };
      }
      return {
        ...prevCart,
        [product.id]: {
          id: product.id,
          nombreProducto: product.nombreProducto,
          cantidad: 1,
        },
      };
    });
  };

  const viewCart = () => {
    navigation.navigate('Cart', { cart });
  };

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput style={styles.searchInput} placeholder="Buscar" />
      </View>

      <Text style={styles.title}>Tiendas y Productos</Text>

      <FlatList
        data={stores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.storeItem}>
            <Text style={styles.storeName}>{item.nombreLocal}</Text>

            {/* Productos en scroll horizontal */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {item.productos.map((product: any) => (
                <View key={product.id} style={styles.product}>
                  <Text style={styles.productName}>{product.nombreProducto}</Text>
                  <Text style={styles.productPrice}>${product.precioProducto}</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => addToCart(product)}
                  >
                    <Text style={styles.addButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        ListEmptyComponent={<Text>No hay tiendas disponibles</Text>}
        contentContainerStyle={stores.length === 0 ? styles.emptyList : null} // Ajuste para centrar la lista vacía
      />

      {/* Barra de navegación inferior */}
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
  container: { flex: 1, paddingTop: 40, backgroundColor: '#f5f5f5' },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    marginLeft: 5,
    fontSize: 16,
    flex: 1,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  storeItem: { padding: 15, marginBottom: 20 },
  storeName: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  product: {
    width: 100,
    backgroundColor: '#fff',
    padding: 10,
    marginRight: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  productName: { fontSize: 13, textAlign: 'center' },
  productPrice: { fontSize: 12, color: '#666', marginVertical: 5 },
  addButton: { backgroundColor: '#0072ff', padding: 5, borderRadius: 5 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;
