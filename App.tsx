import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Login from './components/login/login'; 
import Cart from './components/cart/cart';
import Register from './components/register/register';
import Home from './components/home/home';
import QRScanner from './components/qrscanner/qrscanner';
import User from './components/user/user';
import ResetPassword from './components/resetPassword/resetPassword';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="QRScanner" component={QRScanner} />
        <Stack.Screen name="Profile" component={User} />
        <Stack.Screen name="Cart" component={Cart} />
        <Stack.Screen name="resetPassword" component={ResetPassword} />
        <Stack.Screen name="Register" component={Register} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
