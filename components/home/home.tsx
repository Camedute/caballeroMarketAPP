import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { handleStoreSearch, handleStoresHome } from '../backend/firebase';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Product {
  id: string;
  nombreProducto: string;
  precioProducto: number;
}

interface Store {
  id: string;
  nombreLocal: string;
  imagenUrl?: string;
  productos: Product[];
}

const Home = ({ navigation }: any) => {
  const [cart, setCart] = useState<any>({});
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const storesData = await handleStoresHome();
        setStores(storesData);
      } catch (error) {
        console.error('Error fetching stores:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  const handleSearch = async () => {
    if (searchQuery === "") {
      Alert.alert("Error", "Por favor ingrese un producto");
    } else {
      try {
        const results = await handleStoreSearch(searchQuery);
        console.log('Resultados de búsqueda:', results);
        setStores(results);
      } catch (error) {
        console.error('Error al realizar la búsqueda:', error);
      }
    }
  };

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const updatedCart = { ...prevCart };
      if (updatedCart[product.id]) {
        updatedCart[product.id].cantidad += 1;
      } else {
        updatedCart[product.id] = { id: product.id, nombreProducto: product.nombreProducto, cantidad: 1 };
      }
      return updatedCart;
    });
  };

  const viewCart = () => {
    navigation.navigate('Cart', { cart });
  };

  const viewStore = (storeId: string) => {
    navigation.navigate('Local', { storeId });
    console.log(storeId);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Tiendas y Productos</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar"
          />
          <TouchableOpacity onPress={handleSearch}>
            <Text>🔎</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0072ff" style={styles.loader} />
        ) : (
          <FlatList
            data={stores}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.cardContainer}>
                <View style={styles.storeCard}>
                  <Image
                    source={{ uri: item.imagenUrl || 'https://via.placeholder.com/150' }}
                    style={styles.storeImage}
                  />
                  <Text style={styles.storeName}>{item.nombreLocal}</Text>

                  {/* Productos en scroll horizontal */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
                    {Array.isArray(item.productos) && item.productos.length > 0 ? (
                      item.productos.map((product) => (
                        <View key={product.id} style={styles.productCard}>
                          <Text style={styles.productName}>{product.nombreProducto}</Text>
                          <Text style={styles.productPrice}>${product.precioProducto}</Text>
                          <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => addToCart(product)}
                          >
                            <Text style={styles.addButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      ))
                    ) : (
                      <Text>No hay productos disponibles</Text> // Mensaje alternativo si no hay productos
                    )}
                  </ScrollView>

                  {/* Botón "Ver Local" */}
                  <TouchableOpacity style={styles.viewButton} onPress={() => viewStore(item.id)}>
                    <Text style={styles.viewButtonText}>Ver Local</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text>No hay tiendas disponibles</Text>}
            contentContainerStyle={stores.length === 0 ? styles.emptyList : null}
          />
        )}

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, backgroundColor: '#f5f5f5' },
  searchBar: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginHorizontal: 20, alignItems: 'center', marginBottom: 10 },
  searchInput: { marginLeft: 5, fontSize: 16, flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  cardContainer: { marginBottom: 20, paddingHorizontal: 20 },
  storeCard: { backgroundColor: '#fff', borderRadius: 10, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, padding: 15, marginBottom: 10 },
  storeImage: { width: 150, height: 150, borderRadius: 10, alignSelf: 'center', marginBottom: 10 },
  storeName: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  productList: { marginTop: 10 },
  productCard: { marginRight: 15, backgroundColor: '#f5f5f5', padding: 10, borderRadius: 8, width: 150 },
  productName: { fontSize: 14, fontWeight: '500' },
  productPrice: { fontSize: 14, marginTop: 5, color:'#0072ff' },
  addButton:{ backgroundColor:'#0072ff', padding :5 , borderRadius :5 , marginTop :10 , alignItems:'center'},
   addButtonText:{ color:'#fff'},
   viewButton:{ backgroundColor:'#0072ff', padding :10 , borderRadius :5 , marginTop :10 , alignItems:'center'},
   viewButtonText:{ color:'#fff', fontSize :16},
   bottomNav:{ flexDirection:'row', justifyContent:'space-around', padding :15 , backgroundColor:'#fff', borderTopLeftRadius :10 , borderTopRightRadius :10 , elevation :10},
   loader:{ flex :1 , justifyContent:'center'},
   emptyList:{ justifyContent:'center', alignItems:'center', height :200},
});

export default Home;