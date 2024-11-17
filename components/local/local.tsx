import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, Alert, Button } from 'react-native';
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
  Categoria: string;
  precioProducto: string;
  imagen: string;
};

const Local: React.FC<StoreDetailsProps> = () => {
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
              nombreProducto: producto.nombreProducto,
              cantidadProducto: producto.cantidadProducto,
              Categoria: producto.Categoria,
              precioProducto: producto.precioProducto,
              imagen: producto.imagen,
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
    if (searchQuery === "") {
      Alert.alert("Error","Por favor ingrese un producto");
    } else {
      try {
        const results = await handleStoresSearch(storeId, searchQuery);
        setProducts(results);
      } catch (error) {
        console.error('Error al realizar la búsqueda:', error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
                    <Button title="Agregar producto"></Button>
                  </View>
                ))}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#0072ff',
  },
  scrollViewContent: {
    paddingBottom: 80,
  },
  backButton: {
    marginTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
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
  },
  searchInput: {
    marginLeft: 5,
    flex: 1,
  },
  storeContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  productContainer: {
    padding: 10,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 5,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productDetails: {
    fontSize: 14,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
});

export default Local;
