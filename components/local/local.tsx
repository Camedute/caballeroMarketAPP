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
  };};

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  backButton: {
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#e91e63',
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  storeContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  storeInfo: {
    fontSize: 16,
    color: '#666',
  },
  storeImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  productContainer: {
    marginTop: 20,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productDetails: {
    fontSize: 14,
    color: '#666',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e91e63',
  },
});

export default Local;
