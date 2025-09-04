import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, Alert 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Feather from "@expo/vector-icons/Feather";

type Obstacle = {
  id: string;
  description: string;
  longitude: string;
  lattitude: string;
};

export default function App() {
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);

  // Charger les obstacles depuis AsyncStorage
  useEffect(() => {
    const loadObstacles = async () => {
      try {
        const stored = await AsyncStorage.getItem("obstacles");
        if (stored) {
          setObstacles(JSON.parse(stored));
        } else {
          await AsyncStorage.setItem("obstacles", JSON.stringify([]));
          setObstacles([]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadObstacles();
  }, []);

  // Ajouter un nouvel obstacle
  const addObstacle = async () => {
    const newObstacle: Obstacle = {
      id: obstacles.length.toString(),
      description: "Nouvel obstacle",
      longitude: "0.0",
      lattitude: "0.0",
    };
    const updated = [newObstacle, ...obstacles];
    setObstacles(updated);
    try {
      await AsyncStorage.setItem("obstacles", JSON.stringify(updated));
    } catch (e) {
      console.error("Erreur lors de l'ajout :", e);
    }
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
          onPress: async () => {
            const updated = obstacles.filter((item) => item.id !== id);
            setObstacles(updated);
            try {
              await AsyncStorage.setItem("obstacles", JSON.stringify(updated));
            } catch (e) {
              console.error("Erreur lors de la suppression :", e);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Obstacle }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.coords}>Longitude: {item.longitude}</Text>
        <Text style={styles.coords}>Lattitude: {item.lattitude}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteObstacle(item.id)}>
        <Feather name="trash-2" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Obstacles</Text>
      {obstacles.length === 0 ? (
        <Text>Aucun obstacle enregistré.</Text>
      ) : (
        <FlatList
          data={obstacles}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}

      {/* Bouton pour ajouter un obstacle */}
      <TouchableOpacity style={styles.fab} onPress={addObstacle}>
        <Feather name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
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
});
