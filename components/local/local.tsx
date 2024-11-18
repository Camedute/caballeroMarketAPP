import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { firebaseConfig } from '../backend/credenciales';
import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { handleStoresSearch } from '../backend/firebase';
import { LinearGradient } from 'expo-linear-gradient'; // Importa LinearGradient
import { useCart } from '../cart/cartContext';

// Inicializa Firebase solo si aún no ha sido inicializado
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const firestore = getFirestore();

type StoreDetailsProps = {
  storeId: string;
};

type StoreData = {
  nombreUsuario: string;
  correoUsuario: string;
  direccion: string;
  telefono: string;
  nombreLocal: string;
  imagenUrl: string;
  uid: string;
};

type ProductData = {
  idProducto: string;
  nombreProducto: string;
  cantidadProducto: string;
  Categoria: string;
  precioProducto: string;
  imagen: string;
  idDueno: string; // Añadimos el idDueno aquí para pasarlo al carrito
};

const Local: React.FC<StoreDetailsProps> = () => {
  const { addToCart } = useCart();
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupedProducts, setGroupedProducts] = useState<{ [key: string]: ProductData[] }>({});

  const route = useRoute();
  const navigation = useNavigation();
  const { storeId } = route.params || {};

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!storeId) return;

      try {
        const storeDoc = await getDoc(doc(firestore, 'Duenos', storeId));
        if (storeDoc.exists()) {
          setStoreData(storeDoc.data() as StoreData);
        }
      } catch (error) {
        console.error('Error al obtener los datos del dueño:', error);
      }
    };

    const fetchInventoryData = async () => {
      if (!storeId) return;

      try {
        const inventoryDoc = await getDoc(doc(firestore, 'Inventario', storeId));
        if (inventoryDoc.exists()) {
          const inventoryData = inventoryDoc.data();
          if (inventoryData && Array.isArray(inventoryData.productos)) {
            const productos = inventoryData.productos.map((producto: any) => ({
              idProducto: producto.id,
              nombreProducto: producto.nombreProducto,
              cantidadProducto: producto.cantidadProducto,
              Categoria: producto.Categoria,
              precioProducto: producto.precioProducto,
              imagen: producto.imagen,
              idDueno: storeId, // Usamos el storeId como idDueno
            }));
            setProducts(productos);

            // Agrupar los productos por categoría
            const grouped = productos.reduce((acc: { [key: string]: ProductData[] }, product) => {
              const category = product.Categoria || 'Sin Categoría';
              if (!acc[category]) {
                acc[category] = [];
              }
              acc[category].push(product);
              return acc;
            }, {});

            setGroupedProducts(grouped);
          }
        }
      } catch (error) {
        console.error('Error al obtener los datos del inventario:', error);
      }
    };

    fetchStoreData();
    fetchInventoryData();
  }, [storeId]);

  const handleSearch = async () => {
    if (searchQuery === '') {
      Alert.alert('Error', 'Por favor ingrese un producto');
    } else {
      try {
        const results = await handleStoresSearch(storeId, searchQuery);
        setProducts(results);
      } catch (error) {
        console.error('Error al realizar la búsqueda:', error);
      }
    }
  };

  // Función actualizada para agregar al carrito con todos los datos
  const handleAddToCart = (product: ProductData) => {
    const cartProduct = {
      idProducto: product.idProducto,
      nombreProducto: product.nombreProducto,
      cantidadProducto: 1, // Inicializamos con cantidad 1
      precioProducto: parseFloat(product.precioProducto), // Convertimos a número
      categoria: product.Categoria,
      imagen: product.imagen,
      idDueno: product.idDueno,
    };

    addToCart(cartProduct);

    // Mostrar todos los datos del producto agregado al carrito
    Alert.alert("¡Agregado!", `El producto ${cartProduct.nombreProducto} fue agregado con éxito al carrito!`);

};
;

  const viewCart = () => {
    navigation.navigate('Cart');
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fondo de gradiente azul a celeste */}
      <LinearGradient colors={['#0099FF', '#66CCFF']} style={styles.gradientBackground}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Regresar</Text>
          </TouchableOpacity>

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

          {storeData && (
            <View style={styles.storeContainer}>
              <Image source={{ uri: storeData.imagenUrl }} style={styles.storeImage} />
              <Text style={styles.storeName}>{storeData.nombreLocal}</Text>
              <Text style={styles.storeInfo}>{storeData.nombreUsuario}</Text>
              <Text style={styles.storeInfo}>{storeData.direccion}</Text>
              <Text style={styles.storeInfo}>{storeData.telefono}</Text>
              <Text style={styles.storeInfo}>{storeData.correoUsuario}</Text>
            </View>
          )}

          <View style={styles.productContainer}>
            {Object.keys(groupedProducts).length > 0 ? (
              Object.entries(groupedProducts).map(([category, products]) => (
                <View key={category}>
                  <Text style={styles.categoryTitle}>{category}</Text>
                  {products.map((product, index) => (
                    <View key={index} style={styles.productCard}>
                      {product.imagen && <Image source={{ uri: product.imagen }} style={styles.productImage} />}
                      <Text style={styles.productName}>{product.nombreProducto}</Text>
                      <Text style={styles.productDetails}>{`Cantidad: ${product.cantidadProducto}`}</Text>
                      <Text style={styles.productPrice}>{`Precio: $${product.precioProducto}`}</Text>
                      <TouchableOpacity onPress={() => handleAddToCart(product)} style={styles.addButton}>
                        <Text style={styles.addButtonText}>Agregar producto</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ))
            ) : (
              <Text>No hay productos disponibles para este dueño.</Text>
            )}
          </View>
        </ScrollView>
      </LinearGradient>

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
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart-outline" size={30} color="#007bff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 80,
  },
  backButton: {
    marginTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    alignSelf: 'flex-start', // Asegura que el botón no ocupe todo el ancho
    marginBottom: 20, // Añadimos margen inferior para separar del campo de búsqueda
  },
  backButtonText: {
    color: '#0072ff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10, // Añadimos margen superior para separarlo un poco más
  },
  searchInput: {
    marginLeft: 5,
    flex: 1,
    padding: 10,
  },
  storeContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  storeImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  storeInfo: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  productContainer: {
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addButton: {
    backgroundColor: '#0072ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
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
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    height: 60,
    zIndex: 10,
  },
});

export default Local;
