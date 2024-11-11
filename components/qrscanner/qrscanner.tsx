import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from '../constants';
import { Ionicons } from '@expo/vector-icons';
import Cart from '../cart/cart';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';  // Importar la librería QRCode

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
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
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

        {!showCamera ? (
          <View style={styles.qrContainer}>
            <Icon name="qrcode-scan" size={100} color="#000" />
            <Text style={styles.qrText}>QR</Text>
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

        {!showCamera && qrData && (
          <View style={styles.qrContainer}>
            <QRCode
              value={qrData}  // Generamos el QR con el ID escaneado
              size={200}
              color="black"
              backgroundColor="white"
            />
            <Text style={styles.qrText}>QR Generado: {qrData}</Text>
          </View>
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

        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Ionicons name="home-outline" size={30} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('QRScanner')}>
            <Ionicons name="qr-code-outline" size={30} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-outline" size={30} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={viewCart}>
            <Ionicons name="cart-outline" size={30} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tab: {
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: '#ccc',
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
    marginBottom: 20,
  },
  qrText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 10,
  },
  scanButton: {
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#f5f5f5',
  },
});

export default QRScanner;
