import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from '../backend/credenciales';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

const QRScanner: React.FC = ({ navigation }: any) => {
  const [cart, setCart] = useState({});
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [qrData, setQrData] = useState<string>('');
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
          const total = orderData.total;
          const idDueno = orderData.idDueno;

          if (typeof total !== 'number' || !idDueno) {
            setConfirmMessage('El pedido no tiene datos válidos (total o idDueno).');
            setModalVisible(true);
            return;
          }

          await updateDoc(orderRef, { realizado: true });

          const ventasRef = doc(firestore, 'Ventas', idDueno);
          const ventasSnapshot = await getDoc(ventasRef);

          if (ventasSnapshot.exists()) {
            const ventasData = ventasSnapshot.data();
            const nuevaGananciaTotal = (ventasData.gananciaTotal || 0) + total;

            await updateDoc(ventasRef, {
              gananciaTotal: nuevaGananciaTotal,
            });
          } else {
            await setDoc(ventasRef, {
              gananciaTotal: total,
            });
          }

          setConfirmMessage('Pedido confirmado.');
        } else {
          setConfirmMessage('El pedido no pertenece a este usuario.');
        }
      } else {
        setConfirmMessage('El pedido no existe.');
      }
    } catch (error) {
      console.error('Error al confirmar el pedido:', error);
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
      <LinearGradient colors={['#0099FF', '#66CCFF']} style={styles.gradientBackground}>
        <View style={styles.container}>
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
              <View style={[styles.qrFrame, { borderColor: '#0099FF' }]}>
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
              <TouchableOpacity style={[styles.backButton, styles.elevated]} onPress={handleHideCamera}>
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
    paddingTop: 100,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#fff',
    fontFamily: 'Arial',
    marginTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 20,  // Aumento el espacio entre los botones del navbar
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
    marginBottom: 40,
  },
  qrFrame: {
    borderWidth: 5,
    borderRadius: 15,
    padding: 10,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 15,
    backgroundColor: '#00CCFF',
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 20,
    backgroundColor: '#f7f7f7',
    elevation: 10,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default QRScanner;
