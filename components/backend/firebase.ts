// Importar la configuración de Firebase
import { firebaseConfig } from "../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Importar herramientas de Firebase
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc, Firestore, getDocs, query, where } from "firebase/firestore";
import { Alert } from "react-native";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

// Inicialización de Firebase
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}

export const auth = getAuth();
export const firestore = getFirestore();

// Función para registrar usuario
export const registerUser = async (email: string, password: string, username: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDocRef = doc(firestore, 'Clientes', user.uid);
    await setDoc(userDocRef, {
      correoUsuario: user.email,
      nombreUsuario: username,
      uid: user.uid,
      fechaHoraCreacion: new Date()
    });

    return { success: true, user };
  } catch (error: any) {
    return { success: false, error };
  }
};

// Función para manejar errores de autenticación
export const handleAuthError = (error: any) => {
  const msjError = error.message;

  if (msjError === "Firebase: Error (auth/email-already-in-use).") {
    Alert.alert('Error', 'Correo Electrónico en uso');
  } else if (msjError === "Firebase: Password should be at least 6 characters (auth/weak-password).") {
    Alert.alert('Error', 'Su contraseña es muy insegura, considere utilizar al menos 6 caracteres');
  } else if(msjError === "Firebase: Error (auth/invalid-email)."){
    Alert.alert('Error', 'Por favor, ingrese un correo válido');
  } else if(msjError === "Firebase: Error (auth/missing-password)."){
    Alert.alert('Error', 'Por favor, ingrese una contraseña');
  } else {
    Alert.alert('Error', 'Problemas con la autenticación');
  }
};

export const handleStoresHome = async () => {
  try {
    const storesRef = collection(firestore, 'Duenos');
    const storesSnap = await getDocs(storesRef);
    const storage = getStorage();  // Obtener el servicio de Firebase Storage

    const storesData = await Promise.all(
      storesSnap.docs.map(async (storeDoc) => {
        const storeData = storeDoc.data();
        const storeId = storeDoc.id;

        // Obtén la URL de la imagen del local desde Firebase Storage
        let imageUrl = null;
        if (storeData.imagenUrl) {
          const imageRef = ref(storage, storeData.imagenUrl); // Asume que imagenUrl es la referencia en Storage
          try {
            imageUrl = await getDownloadURL(imageRef);
          } catch (error) {
            console.error("Error obteniendo la imagen de Firebase Storage:", error);
          }
        }

        // Obtén los productos del dueño desde Inventario
        const inventoryRef = doc(firestore, 'Inventario', storeId);
        const inventorySnap = await getDoc(inventoryRef);

        let productos = [];
        if (inventorySnap.exists()) {
          productos = inventorySnap.data().productos || [];
        }

        return {
          id: storeId,
          ...storeData,
          productos,
          imageUrl, // Agregar la URL de la imagen al objeto retornado
        };
      })
    );

    return storesData;
  } catch (error) {
    console.error("Error obteniendo las tiendas y productos:", error);
    return [];
  }
};