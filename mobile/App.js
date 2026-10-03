import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Image, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';

export default function App() {
  const [plats, setPlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPlats();
  }, []);

  const fetchPlats = async () => {
    try {
      setLoading(true);
      // '10.0.2.2' is used for Android Emulator to connect to localhost on the host machine
      const response = await fetch('http://10.0.2.2:8080/api/v1/public/menu');
      const data = await response.json();
      setPlats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image || 'https://via.placeholder.com/150' }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.price}>{item.price} FCFA</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Commander</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredPlats = plats.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.variantes && p.variantes.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lekk Rek</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Qu'est-ce que vous voulez manger ?"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#E53E3E" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredPlats}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Aucun plat trouvé.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    backgroundColor: '#E53E3E',
    padding: 20,
    alignItems: 'center',
    paddingTop: 40, // For notch
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchInput: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
  },
  cardContent: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    color: '#E53E3E',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#1A202C',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    color: '#718096',
    marginTop: 50,
  },
});
