import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Login from './components/login/login';
import TabNavigator from './components/tabsnavigator/TabsNavigator';  
import Cart from './components/cart/cart';
import Register from './components/register/register';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={TabNavigator} />
        <Stack.Screen name="Cart" component={Cart} />
        <Stack.Screen name="Register" component={Register} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
