import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from '../constants';

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

const QRScanner: React.FC = () => {
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

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    console.log('QR Escaneado:', data); // Log para verificar el QR escaneado
    setScanned(true);
    setShowCamera(false);
    setQrData(data);
    await confirmOrder(data); // Llamada a la función de confirmación de pedido

    setTimeout(() => {
      setScanned(false);
      setModalVisible(false);
    }, 2000);
  };

  const handleShowCamera = () => {
    setShowCamera(true);
    setScanned(false);
  };

  const confirmOrder = async (orderId: string) => {
    const user = auth.currentUser;
    console.log('Usuario Actual:', user ? user.uid : 'No autenticado'); // Log para verificar el usuario

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
        console.log('Datos del Pedido:', orderData); // Log para verificar los datos del pedido

        // Comprobar si el idCliente coincide
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
    <View style={styles.container}>
      {!showCamera ? (
        <View style={styles.buttonContainer}>
          <Icon name="qrcode-scan" size={50} color="#000" style={styles.icon} />
          <Button title="Mostrar Cámara" onPress={handleShowCamera} />
        </View>
      ) : (
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          style={StyleSheet.absoluteFillObject}
        >
          {scanned && (
            <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
          )}
        </CameraView>
      )}
      <Modal isVisible={modalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>Escaneado con éxito</Text>
          <Text style={styles.modalText}>{confirmMessage || qrData}</Text>
          <Button title="Cerrar" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  icon: {
    marginBottom: 10,
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
});

export default QRScanner;
