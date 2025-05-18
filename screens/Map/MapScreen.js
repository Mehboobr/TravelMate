
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

const MapScreen = ({ navigation, route }) => {
  const [journals, setJournals] = useState([]);
  const centerLocation = route?.params?.centerLocation;

  const [region, setRegion] = useState(null);

  useEffect(() => {
    const fetchJournals = async () => {
      const snapshot = await getDocs(collection(db, 'journals'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJournals(data);

      // Center on specific location if passed
      if (centerLocation?.latitude && centerLocation?.longitude) {
        setRegion({
          latitude: centerLocation.latitude,
          longitude: centerLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    };

    fetchJournals();
  }, [centerLocation]);


  return (
    <MapView
      style={styles.map}
      showsUserLocation
      initialRegion={region || {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {journals.map((entry) => (
        entry.location && (
          <Marker
            key={entry.id}
            coordinate={{
              latitude: entry.location.latitude,
              longitude: entry.location.longitude,
            }}
          >
            <Callout onPress={() => navigation.navigate('JournalDetail', { journal: entry })}>
              <View style={styles.callout}>
                <Text style={styles.title}>{entry.title}</Text>
                <Text numberOfLines={2} style={styles.notes}>{entry.notes}</Text>
              </View>
            </Callout>
          </Marker>
        )
      ))}
    </MapView>
  );

};

export default MapScreen;

const styles = StyleSheet.create({
  map: { flex: 1 ,marginTop:30},
  callout: { width: 200 },
  title: { fontWeight: 'bold', fontSize: 14 },
  notes: { color: '#555' },
});
