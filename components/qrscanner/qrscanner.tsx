import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from '../backend/credenciales';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient'; // Importar LinearGradient

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

const QRScanner: React.FC = ({ navigation }: any) => {
  const [cart, setCart] = useState({});
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [qrData, setQrData] = useState<string>('');  // Para almacenar el ID escaneado
  const [confirmMessage, setConfirmMessage] = useState<string>('');

  useEffect(() => {
    const askForPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    askForPermissions();
  }, []);

  const viewCart = () => {
    navigation.navigate('Cart', { cart });
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    setShowCamera(false);
    setQrData(data);  // Guardamos el ID escaneado
    const user = auth.currentUser;
    if (user) {
      console.log(`ID Usuario: ${user.uid}`);
    }
    console.log(`ID Escaneado (QR): ${data}`);

    await confirmOrder(data);

    setTimeout(() => {
      setScanned(false);
      setModalVisible(false);
    }, 2000);
  };

  const handleShowCamera = () => {
    setShowCamera(true);
    setScanned(false);
  };

  const handleHideCamera = () => {
    setShowCamera(false);
  };

  const confirmOrder = async (orderId: string) => {
    const user = auth.currentUser;

    if (!user) {
      setConfirmMessage('No hay usuario autenticado.');
      setModalVisible(true);
      return;
    }

    try {
      const orderRef = doc(firestore, 'Pedidos', orderId);
      const orderDoc = await getDoc(orderRef);

      if (orderDoc.exists()) {
        const orderData = orderDoc.data();

        if (orderData.idCliente === user.uid) {
          await updateDoc(orderRef, { realizado: true });
          setConfirmMessage('Pedido confirmado con éxito.');
        } else {
          setConfirmMessage('El pedido no pertenece a este usuario.');
        }
      } else {
        setConfirmMessage('El pedido no existe.');
      }
    } catch (error) {
      setConfirmMessage('Error en la consulta.');
    } finally {
      setModalVisible(true);
    }
  };

  if (hasPermission === null) {
    return <Text>Solicitando permisos para la cámara...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No se han otorgado permisos para la cámara.</Text>;
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      {/* Fondo de gradiente azul a celeste */}
      <LinearGradient colors={['#0099FF', '#66CCFF']} style={styles.gradientBackground}>
        <View style={styles.container}>
          {/* Título */}
          <Text style={styles.title}>Escanea tu compra!</Text>

          <View style={styles.header}>
            <TouchableOpacity
              style={[styles.tab, !showCamera && styles.activeTab]}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.tabText}>Mostrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, showCamera && styles.activeTab]}
              onPress={handleShowCamera}
            >
              <Text style={styles.tabText}>Escanear</Text>
            </TouchableOpacity>
          </View>

          {/* Elementos elevados */}
          {!showCamera ? (
            <View style={[styles.qrContainer, styles.elevated]}>
              <View style={[styles.qrFrame, { borderColor: '#0099FF' }]}>  {/* Cambio de color de borde */}
                <QRCode
                  value={auth.currentUser?.uid || 'Sin usuario'}
                  size={250}  
                  color="black"
                  backgroundColor="white"
                />
              </View>
            </View>
          ) : (
            <CameraView
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              style={StyleSheet.absoluteFillObject}
            >
              {scanned && (
                <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />
              )}
              <TouchableOpacity style={styles.backButton} onPress={handleHideCamera}>
                <Text style={styles.backButtonText}>Regresar</Text>
              </TouchableOpacity>
            </CameraView>
          )}

          <TouchableOpacity style={styles.scanButton} onPress={handleShowCamera}>
            <Text style={styles.scanButtonText}>Escanear</Text>
          </TouchableOpacity>

          <Modal isVisible={modalVisible}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Escaneado con éxito</Text>
              <Text style={styles.modalText}>{confirmMessage || qrData}</Text>
              <Button title="Cerrar" onPress={() => setModalVisible(false)} />
            </View>
          </Modal>
        </View>
      </LinearGradient>

      {/* Barra de navegación inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={30} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('QRScanner')}>
          <Ionicons name="qr-code-outline" size={30} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={30} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart-outline" size={30} color="#007bff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 15,
    paddingTop: 100, // Aumenté el espacio superior para mover el título más arriba
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#fff',
    fontFamily: 'Arial', // Fuente más llamativa
    marginTop: 30, // Aumenté el margen superior para que esté aún más arriba
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  tab: {
    padding: 12,
    borderRadius: 25,
    marginHorizontal: 8,
    backgroundColor: '#f0f0f5',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  qrFrame: {
    borderWidth: 5,  // Hacer el borde más grueso
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButton: {
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 25,
    marginBottom: 30,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    height: 60,
    zIndex: 10,
  },
  elevated: {
    elevation: 5, // Sombra para simular elevación
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});

export default QRScanner;
