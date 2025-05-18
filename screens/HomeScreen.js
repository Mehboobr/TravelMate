import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ImageBackground,
    TextInput,
    SafeAreaView,
} from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfig';
import { StatusBar } from 'expo-status-bar';
import { formatDate } from '../utils/formatDate';
import { Ionicons } from '@expo/vector-icons';
import Fonts from '../constant/fonts';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const HomeScreen = ({ navigation }) => {
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        if (user?.uid) {
            await fetchJournals(user.uid);
        }
        setRefreshing(false);
    };


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                await fetchJournals(user.uid);
            }
        });

        return unsubscribe;
    }, []);

    const fetchJournals = async (userId) => {
        try {
            const q = query(collection(db, 'journals'), where('userId', '==', userId));
            const snapshot = await getDocs(q);
            const entries = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => {
                    const dateA = a.createdAt?.toDate?.() || new Date(0);
                    const dateB = b.createdAt?.toDate?.() || new Date(0);
                    return dateB - dateA;
                });

            setJournals(entries);
        } catch (error) {
            console.log('Error fetching journals:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredJournals = journals.filter(j => {
        const titleMatch = j.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const locationMatch = j.locationName?.toLowerCase().includes(searchQuery.toLowerCase());
        const dateMatch = formatDate(j.createdAt?.toDate?.() || new Date())
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        return titleMatch || locationMatch || dateMatch;
    });

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => navigation.navigate('JournalDetail', { journal: item })}
        >
            <ImageBackground
                source={{ uri: item.images?.[0] || 'https://via.placeholder.com/400x200' }}
                style={styles.cardImage}
                imageStyle={{ borderRadius: 16 }}
            >
                <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>
                        {formatDate(item.createdAt?.toDate?.() || new Date())}
                    </Text>
                </View>
                <View style={styles.overlay} />
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.title}</Text>

                    <View style={styles.rowBetween}>
                        <Text
                            numberOfLines={2}
                            ellipsizeMode="tail"
                            style={styles.cardNote}
                        >
                            {item.summary || 'No summary available.'}
                        </Text>

                        <TouchableOpacity
                            style={styles.exploreButton}
                            onPress={() => navigation.navigate('Map', { centerLocation: item.location })}
                        >
                            <Ionicons name="location-outline" size={16} color="#fff" />
                            <Text style={styles.exploreText}>View Map</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeContainer}>
            <StatusBar style="dark" backgroundColor="#fff" />

            {journals.length > 0 &&
                <View style={styles.topBar}>
                    <TextInput
                        placeholder="Search by title or date"
                        placeholderTextColor="#aaa"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={styles.searchBar}
                    />
                    <Ionicons name="search" size={20} color={Colors.primary} style={styles.searchIcon} />
                </View>}

            {loading ? (
                <ActivityIndicator size="large" color={Colors.primary} />
            ) : (
                <FlatList
                    data={filteredJournals}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No journal entries yet. Start your first trip!</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginVertical: 16,
        backgroundColor: '#fff',
    },
    searchIcon: {
        marginLeft: 8,
    },
    searchBar: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        padding: 0,
        fontFamily: Fonts.Medium,
    },
    cardContainer: {
        marginBottom: 20,
    },
    cardImage: {
        height: 200,
        justifyContent: 'flex-end',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 16,
    },
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontFamily: Fonts.Bold,
        color: Colors.white,
        marginBottom: 8,
    },
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    cardNote: {
        fontSize: 14,
        fontFamily: Fonts.Regular,
        color: Colors.white,
        flex: 1,
    },
    exploreButton: {
        backgroundColor: '#000',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    exploreText: {
        color: Colors.white,
        fontSize: 12,
        fontFamily: Fonts.Medium,
    },
    dateContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    dateText: {
        color: Colors.white,
        fontSize: 12,
        fontFamily: Fonts.Medium,
    },
    emptyText: {
        textAlign: 'center',
        color: Colors.gray,
        fontFamily: Fonts.Medium,
        marginTop: 32,
        fontSize: 16,
    },
});
