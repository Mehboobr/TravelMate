// screens/NewJournalScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../services/firebaseConfig';

const NewJournalScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState(null);
  const [imageBase64StringArray, setImageBase64StringArray] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) setUser(user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is needed to tag your journal');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  const pickImageFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      base64: false,
      quality: 0.5
    });

    if (!result.canceled) {
      const newImages = await Promise.all(
        result.assets.map(async (asset) => {
          const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });
          return `data:image/jpeg;base64,${base64}`;
        })
      );
      setImageBase64StringArray(prev => [...prev, ...newImages]);
    }
  };

  const pickImageFromCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      base64: false,
      quality: 0.5
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: 'base64' });
      setImageBase64StringArray(prev => [...prev, `data:image/jpeg;base64,${base64}`]);
    }
  };

  const generateSummary = async () => {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o',
          messages: [{ role: 'user', content: notes }],
          max_tokens: 500,
        }),
      });

      const data = await res.json();
      if (data?.choices?.length > 0) {
        setSummary(data.choices[0].message.content);
      } else if (data?.error?.message) {
        Alert.alert('API Error', data.error.message);
      } else {
        Alert.alert('Unexpected response format');
      }
    } catch (error) {
      console.log('error in generateSummary', error);
      Alert.alert('Error generating summary');
    }
  };
  

  const uploadJournal = async () => {
    if (!title || !notes || !location) {
      Alert.alert('Please fill all fields');
      return;
    }

    setUploading(true);
    try {
      await addDoc(collection(db, 'journals'), {
        title,
        notes,
        summary,
        images: imageBase64StringArray,
        location,
        createdAt: new Date(),
        userId: user.uid,
      });

      Alert.alert('Success', 'Journal created!');
      navigation.goBack();
    } catch (error) {
      console.log('Upload failed:', error);
      Alert.alert('Upload failed', error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.heading}>New Journal Entry</Text>

        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TextInput
          placeholder="Notes"
          value={notes}
          onChangeText={setNotes}
          style={[styles.input, { height: 100 }]}
          multiline
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={pickImageFromLibrary} style={styles.imageButton}>
            <Text style={styles.imageText}>Pick from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImageFromCamera} style={styles.imageButton}>
            <Text style={styles.imageText}>Capture Photo</Text>
          </TouchableOpacity>
        </View>

        {imageBase64StringArray.length > 0 && (
          <ScrollView horizontal style={{ marginTop: 10 }}>
            {imageBase64StringArray.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img }}
                style={styles.image}
              />
            ))}
          </ScrollView>
        )}

        <TouchableOpacity onPress={generateSummary} style={styles.summaryButton}>
          <Text style={styles.buttonText}>Generate Summary</Text>
        </TouchableOpacity>
        {summary ? <Text style={styles.summary}>Summary: {summary}</Text> : null}

        <TouchableOpacity onPress={uploadJournal} style={styles.uploadButton} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Journal</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default NewJournalScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  imageButton: {
    backgroundColor: '#e6f0ef',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center'
  },
  imageText: { color: '#26695c', fontSize: 14 },
  image: { width: 100, height: 100, marginRight: 10, borderRadius: 8 },
  summaryButton: {
    backgroundColor: '#2a7f6e',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center'
  },
  summary: { marginTop: 10, fontStyle: 'italic', color: '#555' },
  uploadButton: {
    backgroundColor: '#26695c',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
