
import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity,
    ActivityIndicator, Alert, ScrollView
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, storage } from '../../services/firebaseConfig';
import Colors from '../../constant/colors';
import Fonts from '../../constant/fonts';
import { OPENROUTER_API_KEY } from '../../apiKeys/keys';


const NewJournalScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [location, setLocation] = useState(null);
    const [imageUriArray, setImageUriArray] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [summary, setSummary] = useState('');
    const [user, setUser] = useState(null);
    const [generating, setGenerating] = useState(false);


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
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setImageUriArray(prev => [...prev, ...result.assets.map(a => a.uri)]);
        }
    };

    const pickImageFromCamera = async () => {
        const result = await ImagePicker.launchCameraAsync({
            quality: 0.7,
        });

        if (!result.canceled) {
            setImageUriArray(prev => [...prev, result.assets[0].uri]);
        }
    };


    const generateSummary = async () => {
        setGenerating(true);
        console.log('OPENROUTER_API_KEY',OPENROUTER_API_KEY)
        try {
            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
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
                console.log('API Error', data)
            } else {
                Alert.alert('Unexpected response format');
            }
        } catch (error) {
            console.log('error in generateSummary', error);
            Alert.alert('Error generating summary');
        } finally {
            setGenerating(false);
        }
    };


    const getBlobFromUri = async (uri) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        return blob.type ? blob : new Blob([blob], { type: 'image/jpeg' });
    };

    const uploadImageAsync = async (uri, user, index) => {
        try {
            const blob = await getBlobFromUri(uri);
            console.log('Uploading blob size:', blob.size, 'type:', blob.type);

            const fileName = `journalImages/${user.uid}/${Date.now()}-${index}.jpg`;
            const imageRef = ref(storage, fileName);
            await uploadBytes(imageRef, blob);
            const downloadURL = await getDownloadURL(imageRef);
            return downloadURL;
        } catch (err) {
            console.error('Upload image error:', err);
            throw err;
        }
    };

    const uploadJournal = async () => {
        if (!title || !notes || !location) {
            Alert.alert('Please fill all fields');
            return;
        }

        setUploading(true);
        try {
            const imageUrls = await Promise.all(
                imageUriArray.map((uri, index) => uploadImageAsync(uri, user, index))
            );

            await addDoc(collection(db, 'journals'), {
                title,
                notes,
                summary,
                images: imageUrls,
                location,
                createdAt: new Date(),
                userId: user.uid,
            });

            Alert.alert('Success', 'Journal created!');
            navigation.goBack();
        } catch (error) {
            console.error('Upload failed:', error);
            Alert.alert('Upload failed', error.message);
        } finally {
            setUploading(false);
        }
    };


    return (
        <View style={styles.container}>
            <ScrollView>

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
                    style={[styles.input, styles.notesInput]}
                    multiline
                    textAlignVertical="top"
                />


                <View style={styles.buttonRow}>
                    <TouchableOpacity onPress={pickImageFromLibrary} style={styles.imageButton}>
                        <Text style={styles.imageText}>Pick from Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={pickImageFromCamera} style={styles.imageButton}>
                        <Text style={styles.imageText}>Capture Photo</Text>
                    </TouchableOpacity>
                </View>

                {imageUriArray.length > 0 && (
                    <ScrollView horizontal style={{ marginTop: 10 }}>
                        {imageUriArray.map((uri, idx) => (
                            <Image
                                key={idx}
                                source={{ uri }}
                                style={styles.image}
                            />
                        ))}
                    </ScrollView>
                )}


                <TouchableOpacity onPress={generateSummary} style={styles.summaryButton} disabled={generating}>
                    {generating ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Generate Summary</Text>
                    )}
                </TouchableOpacity>

                {summary ? (
                    <View style={styles.summaryBox}>
                        <ScrollView style={styles.summaryScroll}>
                            <Text style={styles.summaryText}>{summary}</Text>
                        </ScrollView>
                    </View>
                ) : null}


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
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        paddingVertical: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 14,
        marginBottom: 14,
        fontSize: 16,
        backgroundColor: '#f9f9f9'
    },
    notesInput: {
        height: 120,
        textAlignVertical: 'top',
    },

    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    imageButton: {
        backgroundColor: Colors.secondary,
        padding: 12,
        borderRadius: 10,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center'
    },
    imageText: {
        color: Colors.primary,
        fontWeight: '600'
    },
    image: {
        width: 100,
        height: 100,
        marginRight: 10,
        borderRadius: 10
    },
    summaryButton: {
        backgroundColor: Colors.primary,
        padding: 14,
        borderRadius: 10,
        marginTop: 20,
        alignItems: 'center'
    },
    summaryBox: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#fff5ec',
        borderRadius: 10,
        maxHeight: 150,
        overflow: 'hidden',
        borderColor: Colors.primary,
        borderWidth: 1
    },
    summaryScroll: {
        maxHeight: 150
    },
    summaryText: {
        fontStyle: 'italic',
        color: '#333',
        fontSize: 14,
       fontFamily: Fonts.Italic,
    },
    uploadButton: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 24
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    }
});

