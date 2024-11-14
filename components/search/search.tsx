import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { debounce } from 'lodash'; // Assuming you have Lodash installed
import { handleStoresSearch } from '../backend/firebase';

interface Store {
  id: string;
  nombreLocal: string;
  direccion: string;
  categoria: string;
}

const SearchResults = ({ route }: any) => {
  const { searchQuery } = route.params; // Parámetro recibido desde la navegación
  const [stores, setStores] = useState<Store[]>([]); // Almacenará las tiendas
  const [loading, setLoading] = useState(true); // Indicador de carga
  const [searchTerm, setSearchTerm] = useState(searchQuery || ""); // Controla el término de búsqueda

  const debouncedSearch = debounce(async () => {
    if (searchTerm.trim() === "") {
      setStores([]); // Si no hay búsqueda, vaciar la lista de tiendas
      setLoading(false);
      return;
    }
    try {
      const storesData = await handleStoresSearch(searchTerm); // Realizar búsqueda
      setStores(storesData); // Actualizar las tiendas con los resultados
    } catch (error) {
      console.error('Error fetching stores:', error);
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, 500); // Debounce para evitar consultas innecesarias

  useEffect(() => {
    debouncedSearch(); // Realizar la búsqueda cuando cambia el término
  }, [searchTerm]); // Dependencia del término de búsqueda

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Buscar Tiendas"
        value={searchTerm}
        onChangeText={setSearchTerm} // Actualizar el término de búsqueda
      />
      <Text style={styles.title}>Resultados para "{searchTerm}"</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0072ff" />
      ) : (
        <FlatList
          data={stores} // Mostrar las tiendas resultantes
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.storeCard}>
              <Text style={styles.storeName}>{item.nombreLocal}</Text>
              {/* Mostrar más detalles de la tienda */}
              <Text style={styles.storeAddress}>Dirección: {item.direccion}</Text>
              <Text style={styles.storeCategory}>Categoría: {item.categoria}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyMessage}>No se encontraron resultados</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  searchBar: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 20,
  },
  storeCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0072ff',
  },
  storeAddress: {
    fontSize: 14,
    color: '#666',
  },
  storeCategory: {
    fontSize: 14,
    color: '#666',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 5,
  },
});

export default SearchResults;
