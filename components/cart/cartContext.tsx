import React, { createContext, useContext, useState } from 'react';

// Definimos el tipo de producto en el carrito
interface CartItem {
  id: string; // ID del producto
  nombreProducto: string; // Nombre del producto
  cantidad: number; // Cantidad agregada al carrito
  precio: number; // Precio del producto
  categoria: string; // Categoría del producto
  idDueno: string; // ID del dueño del producto
}

// Creamos el tipo del contexto
interface CartContextType {
  cart: { [key: string]: CartItem };
  addToCart: (product: ProductData) => void;
  clearCart: () => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, cantidad: number) => void;
}

// Definimos la interfaz del producto
interface ProductData {
  idProducto: string;
  nombreProducto: string;
  precioProducto: number;
  categoria: string;
  idDueno: string;
}

// Creamos el contexto
const CartContext = createContext<CartContextType | undefined>(undefined);

// Proveedor del contexto
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<{ [key: string]: CartItem }>({});

  // Función para agregar al carrito
  const addToCart = (product: ProductData) => {
    setCart((prevCart) => {
      const updatedCart = { ...prevCart };
      const id = product.idProducto;

      // Si el producto ya está en el carrito, incrementamos la cantidad
      if (updatedCart[id]) {
        updatedCart[id].cantidad += 1;
      } else {
        // Si el producto no está en el carrito, lo agregamos
        updatedCart[id] = {
          id: id,
          nombreProducto: product.nombreProducto,
          cantidad: 1,
          precio: product.precioProducto,
          categoria: product.categoria,
          idDueno: product.idDueno,
        };
      }
      console.log('Carrito actualizado:', updatedCart);
      return updatedCart;
    });
  };

  // Función para eliminar un producto del carrito
  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const updatedCart = { ...prevCart };
      delete updatedCart[productId];
      console.log('Producto eliminado del carrito:', productId);
      return updatedCart;
    });
  };

  // Función para actualizar la cantidad de un producto en el carrito
  const updateQuantity = (productId: string, cantidad: number) => {
    setCart((prevCart) => {
      const updatedCart = { ...prevCart };
      if (updatedCart[productId]) {
        updatedCart[productId].cantidad = cantidad;
        console.log(`Cantidad actualizada para ${productId}:`, cantidad);
      }
      return updatedCart;
    });
  };

  // Función para limpiar el carrito
  const clearCart = () => {
    setCart({});
    console.log('Carrito limpiado');
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, clearCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};
