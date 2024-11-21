import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { handleStoreSearch, handleStoresHome } from '../backend/firebase';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const Home = ({ navigation }: any) => {
  const [cart, setCart] = useState<any>({});
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const storesData = await handleStoresHome();
        console.log(storesData);
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
      <LinearGradient
        colors={['#0099FF', '#66CCFF']} // Gradiente de azul a celeste
        style={styles.container} // Aplica el gradiente al contenedor principal
      >
        <Text style={styles.title}>Tiendas y Productos</Text>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar tienda"
          />
          <TouchableOpacity onPress={handleSearch}>
            <Ionicons name="search" size={24} color="#0072ff" />
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
                  <Text style={styles.biography}>{item.biografia}</Text>
                  {/* Productos en scroll horizontal */}
                  
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
            <Ionicons name="home-outline" size={30} color="#0072ff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('QRScanner')}>
            <Ionicons name="qr-code-outline" size={30} color="#0072ff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-outline" size={30} color="#0072ff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={viewCart}>
            <Ionicons name="cart-outline" size={30} color="#0072ff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 }, // Mantener flex y agregar padding para el fondo
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 25,
    marginHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchInput: {
    fontSize: 16,
    flex: 1,
    paddingVertical: 0,
    paddingLeft: 10,
    color: '#333',
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#fff' },
  cardContainer: { marginBottom: 20, paddingHorizontal: 20 },
  storeCard: { backgroundColor: '#fff', borderRadius: 10, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, padding: 15, marginBottom: 10 },
  storeImage: { width: 150, height: 150, borderRadius: 10, alignSelf: 'center', marginBottom: 10 },
  storeName: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  biography: { fontSize: 16, fontStyle: 'italic',fontWeight: 'normal', marginBottom: 20,  textAlign: 'center', lineHeight: 22, color: '#555'},
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
