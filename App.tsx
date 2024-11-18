import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './components/backend/firebase';

import Login from './components/login/login';
import Cart from './components/cart/cart';
import Register from './components/register/register';
import Home from './components/home/home';
import QRScanner from './components/qrscanner/qrscanner';
import User from './components/user/user';
import ResetPassword from './components/resetPassword/resetPassword';
import Local from './components/local/local';
import SearchResults from './components/search/search';

import { CartProvider } from './components/cart/cartContext';

const Stack = createStackNavigator();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Listener para cambios en la autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setLoading(false);
    });

    // Limpieza del listener al desmontar el componente
    return () => unsubscribe();
  }, []);

  // Pantalla de carga mientras se verifica el estado de autenticación
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0072ff" />
      </View>
    );
  }

  return (
    <CartProvider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // Rutas cuando el usuario está autenticado
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="QRScanner" component={QRScanner} />
            <Stack.Screen name="Profile" component={User} />
            <Stack.Screen name="Cart" component={Cart} />
            <Stack.Screen name="Local" component={Local} />
            <Stack.Screen name="Search" component={SearchResults} />
          </>
        ) : (
          // Rutas cuando el usuario no está autenticado
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="reset" component={ResetPassword} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </CartProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
});

export default App;
