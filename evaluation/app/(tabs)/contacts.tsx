import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Alert, Linking, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Feather from '@expo/vector-icons/Feather';

type Contact = {
  id: string;
  name: string;
  phone: string;
  tel: string;
  mail: string;
};

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  const defaultContacts: Contact[] = [
    { id: "1", name: "Alice Dupont", phone: "06 12 34 56 78", tel: "+33612345678", mail: "alice.dupont@gmail.com"},
    { id: "2", name: "Jean Martin", phone: "07 87 65 43 21", tel: "+33787654321", mail: "jean.martin@gmail.com" },
    { id: "3", name: "Sophie Bernard", phone: "06 98 76 54 32", tel: "+33698765432", mail: "sophie.bernard@gmail.com" },
  ];

  const lancerAppel = (tel: string) => {
    const url = `tel:${tel}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert("Erreur", "Impossible d'ouvrir l'application téléphone");
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error("Erreur :", err));
  };

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const stored = await AsyncStorage.getItem("contacts");
        if (stored) {
          setContacts(JSON.parse(stored));
        } else {
          await AsyncStorage.setItem("contacts", JSON.stringify(defaultContacts));
          setContacts(defaultContacts);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const deleteContacts = async () => {
      try {
        await AsyncStorage.removeItem('contacts');
      } catch (error) {
        console.log('Error removing contacts key:', error);
      }
    };

    const initializeContacts = async () => {
      await deleteContacts();
      await loadContacts();
    };

    initializeContacts();
  }, []);

  const renderItem = ({ item }: { item: Contact }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.mail}>{item.mail}</Text>
      <Text style={styles.phone}>{item.phone}</Text>
      

      <TouchableOpacity
        style={styles.callButton}
        onPress={() => lancerAppel(item.tel)}
      >
        <Text style={styles.callButtonText}>Appeler</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}><Feather name="phone" size={24} color="black" /> Mes Contacts</Text>
      <FlatList
        data={contacts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  card: {
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
  name: { fontSize: 18, fontWeight: "600" },
  phone: { fontSize: 16, color: "#555" },
  mail: { fontSize: 16, color: "#555" },
  callButton: {
    marginTop: 10,
    backgroundColor: "green",
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  callButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
