import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Button,
  Linking
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import * as Location from 'expo-location';

type Obstacle = {
  id: string;
  description: string;
  longitude: string;
  lattitude: string;
};

export default function App() {
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentObstacle, setCurrentObstacle] = useState<Obstacle | null>(null);
  const [description, setDescription] = useState("");
  const [longitude, setLongitude] = useState("");
  const [lattitude, setLattitude] = useState("");

  // Charger les obstacles depuis AsyncStorage
  useEffect(() => {
    const loadObstacles = async () => {
      try {
        const stored = await AsyncStorage.getItem("obstacles");
        if (stored) {
          setObstacles(JSON.parse(stored));
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadObstacles();
  }, []);

  const saveObstacles = async (updated: Obstacle[]) => {
    setObstacles(updated);
    try {
      await AsyncStorage.setItem("obstacles", JSON.stringify(updated));
    } catch (e) {
      console.error("Erreur lors de la sauvegarde :", e);
    }
  };

  // Ajouter ou modifier un obstacle
  const saveObstacle = () => {
    if (!description || !longitude || !lattitude) {
      Alert.alert("Erreur", "Tous les champs sont requis");
      return;
    }

    if (currentObstacle) {
      // Modifier
      const updated = obstacles.map((o) =>
        o.id === currentObstacle.id
          ? { ...o, description, longitude, lattitude }
          : o
      );
      saveObstacles(updated);
    } else {
      // Ajouter
      const newObstacle: Obstacle = {
        id: Date.now().toString(),
        description,
        longitude,
        lattitude,
      };
      saveObstacles([newObstacle, ...obstacles]);
    }

    setModalVisible(false);
    setCurrentObstacle(null);
    setDescription("");
    setLongitude("");
    setLattitude("");
  };

  // Supprimer un obstacle
  const deleteObstacle = (id: string) => {
    Alert.alert(
      "Supprimer l'obstacle",
      "Êtes-vous sûr de vouloir supprimer cet obstacle ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            const updated = obstacles.filter((item) => item.id !== id);
            saveObstacles(updated);
          },
        },
      ]
    );
  };

  // Ouvrir le formulaire pour ajouter
  const openAddModal = async () => {
  setCurrentObstacle(null);
  setDescription("");
  
  try {
    // Demander la permission
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission refusée", "Impossible d'accéder à la localisation");
      setLongitude("");
      setLattitude("");
    } else {
      // Récupérer la position
      let location = await Location.getCurrentPositionAsync({});
      setLongitude(location.coords.longitude.toString());
      setLattitude(location.coords.latitude.toString());
    }
  } catch (error) {
    console.error(error);
    setLongitude("");
    setLattitude("");
  }

  setModalVisible(true);
};

  // Ouvrir le formulaire pour éditer
  const openEditModal = (obstacle: Obstacle) => {
    setCurrentObstacle(obstacle);
    setDescription(obstacle.description);
    setLongitude(obstacle.longitude);
    setLattitude(obstacle.lattitude);
    setModalVisible(true);
  };

  const openInMaps = (latitude: string, longitude: string) => {
  const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert("Erreur", "Impossible d'ouvrir Google Maps");
    }
  });
};

  const renderItem = ({ item }: { item: Obstacle }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.coords}>Longitude: {item.longitude}</Text>
        <Text style={styles.coords}>Lattitude: {item.lattitude}</Text>
      </View>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity onPress={() => openInMaps(item.lattitude, item.longitude)} style={{ marginRight: 10 }}>
          <Feather name="map-pin" size={24} color="green" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openEditModal(item)} style={{ marginRight: 10 }}>
          <Feather name="edit-3" size={24} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteObstacle(item.id)}>
          <Feather name="trash-2" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <MaterialIcons name="report-problem" size={24} color="black" />
        <Text style={styles.title}>Liste des obstacles</Text>
      </View>

      {obstacles.length === 0 ? (
        <Text>Aucun obstacle enregistré.</Text>
      ) : (
        <FlatList
          data={obstacles}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}

      {/* Modal pour ajouter/éditer */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
              {currentObstacle ? "Modifier obstacle" : "Ajouter obstacle"}
            </Text>
            <TextInput
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
            />
            <TextInput
              placeholder="Longitude"
              value={longitude}
              onChangeText={setLongitude}
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Lattitude"
              value={lattitude}
              onChangeText={setLattitude}
              style={styles.input}
              keyboardType="numeric"
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Button title="Annuler" onPress={() => setModalVisible(false)} />
              <Button title="Enregistrer" onPress={saveObstacle} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Bouton pour ajouter un obstacle */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Feather name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  titleContainer: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginLeft: 5 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  description: { fontSize: 18, fontWeight: "600", marginBottom: 5 },
  coords: { fontSize: 14, color: "#555" },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "green",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    padding: 20,
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});
