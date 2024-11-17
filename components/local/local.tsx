import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Button, TouchableOpacity, TextInput, Alert } from 'react-native';
import { firebaseConfig } from '../backend/credenciales'; 
import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { handleStoresSearch } from '../backend/firebase';

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
  nombreProducto: string;
  cantidadProducto: string;
  precioProducto: string;
  imagen: string;
};

const Local: React.FC<StoreDetailsProps> = () => {
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [searchQuery, setSearchQuery] = useState(''); // Estado para el texto de búsqueda
  
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
            setProducts(inventoryData.productos.map((producto: any) => ({
              nombreProducto: producto.nombreProducto,
              cantidadProducto: producto.cantidadProducto,
              precioProducto: producto.precioProducto,
              imagen: producto.imagen,
            })));
          }
        }
      } catch (error) {
        console.error('Error al obtener los datos del inventario:', error);
      }
    };

    fetchStoreData();
    fetchInventoryData();
  }, [storeId]);

  // Función para manejar la búsqueda
  const handleSearch = async () => {
    if (searchQuery === "") {
      Alert.alert("Error","Por favor ingrese un producto");
    } else {
      try {
        const results = await handleStoresSearch(storeId, searchQuery);
        console.log('Resultados de búsqueda:', results);
        setProducts(results); // Actualizar el estado con los productos filtrados
      } catch (error) {
        console.error('Error al realizar la búsqueda:', error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Botón de regresar */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Regresar</Text>
        </TouchableOpacity>

        {/* Barra de búsqueda */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery} // Actualizar el estado con el texto ingresado
            placeholder="Buscar"
          />
          <TouchableOpacity onPress={handleSearch}>
            <Text>🔎</Text>
          </TouchableOpacity>
        </View>

        {/* Mostrar datos del dueño */}
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
        
        {/* Mostrar productos del inventario */}
        <View style={styles.productContainer}>
          {products.length > 0 ? (
            products.map((product, index) => (
              <View key={index} style={styles.productCard}>
                {product.imagen && <Image source={{ uri: product.imagen }} style={styles.productImage} />}
                <Text style={styles.productName}>{product.nombreProducto}</Text>
                <Text style={styles.productDetails}>{`Cantidad: ${product.cantidadProducto}`}</Text>
                <Text style={styles.productPrice}>{`Precio: $${product.precioProducto}`}</Text>
                <Button title="Agregar Producto" onPress={() => navigation.navigate('AgregarProducto', { product })} />
              </View>
            ))
          ) : (
            <Text>No hay productos disponibles para este dueño.</Text>
          )}
        </View>
      </ScrollView>

      {/* Barra de navegación inferior - con los mismos íconos y diseño del código original */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={30} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('QRScanner')}>
          <Ionicons name="qr-code-outline" size={30} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
          <Ionicons name="person-outline" size={30} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Carrito')}>
          <Ionicons name="cart-outline" size={30} color="#007bff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E0F7FA', // Fondo celeste
  },
  scrollViewContent: {
    paddingBottom: 80, // Espacio adicional para el navbar
  },
  backButton: {
    marginTop: 30,  // Espacio adicional para el botón de regresar
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#007bff', // Azul
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,  // Aumenta el margen inferior para separar más de la siguiente sección
  },
  searchInput: {
    marginLeft: 5,
    fontSize: 16,
    flex: 1,
  },
  storeContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  storeInfo: {
    fontSize: 16,
    color: '#666',
    marginVertical: 5,
  },
  storeImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 15,
  },
  productContainer: {
    marginTop: 30,  // Se aumenta la separación de los productos con la información de la tienda
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productDetails: {
    fontSize: 14,
    color: '#666',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    height: 60,
    zIndex: 10,
  },
});

export default Local;
