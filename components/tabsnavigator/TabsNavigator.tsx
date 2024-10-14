import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Home from '../home/home'; // Ajusta la ruta según la ubicación real de tu componente
import User from '../user/user'; // Ajusta la ruta según la ubicación real de tu componente
import QRScanner from '../qrscanner/qrscanner'; // Ajusta la ruta según la ubicación real de tu componente
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 70,
          backgroundColor: '#f8f8f8',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      
      <Tab.Screen
        name="QRScanner"
        component={QRScanner}
        options={{
          tabBarButton: (props) => (
            <TouchableOpacity {...props} style={styles.qrButtonContainer}>
              <Ionicons name="qr-code" size={50} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <Tab.Screen name="Profile" component={User} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  qrButtonContainer: {
    position: 'absolute',
    bottom: 25, // Para separarlo del borde inferior
    left: '50%', // Esto lo posiciona en el 50% del ancho del contenedor
    transform: [{ translateX: -35 }], // Esto mueve el botón a la izquierda para que quede centrado (mitad del tamaño del botón)
    height: 70,
    width: 70,
    borderRadius: 35,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5, // Para sombra en Android
  },
});

export default TabNavigator;
