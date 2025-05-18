import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constant/colors';
import Fonts from '../../constant/fonts';

const { width, height } = Dimensions.get('window');

const JournalDetailScreen = ({ route }) => {
  const { journal } = route.params;
  const navigation = useNavigation();
  const [readableLocation, setReadableLocation] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const renderImage = ({ item }) => (
    <Image source={{ uri: item }} style={styles.image} />
  );

  useEffect(() => {
    if (journal.location) {
      (async () => {
        try {
          const geocode = await Location.reverseGeocodeAsync(journal.location);
          if (geocode.length > 0) {
            const { city, region, country } = geocode[0];
            setReadableLocation(`${city || ''}, ${region || ''}, ${country || ''}`);
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
        }
      })();
    }
  }, []);

  const handleLocationPress = () => {
    if (journal.location) {
      navigation.navigate('Map', { centerLocation: journal.location });
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageCarousel}>
          <FlatList
            data={journal.images}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            renderItem={renderImage}
            onScroll={e => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentIndex(index);
            }}
            scrollEventThrottle={16}
          />

          <View style={styles.pagination}>
            {journal?.images?.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex ? styles.activeDot : null
                ]}
              />
            ))}
          </View>

          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{journal.title}</Text>

          <Text style={styles.label}>Notes:</Text>
          <Text style={styles.text}>{journal.notes}</Text>

          {journal.summary && (
            <>
              <Text style={styles.label}>AI Summary:</Text>
              <Text style={styles.text}>{journal.summary}</Text>
            </>
          )}

          <Text style={styles.label}>Location:</Text>
          <Pressable onPress={handleLocationPress}>
            <Text style={[styles.text, styles.linkText]}>
              📍 {readableLocation || 'Loading...'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default JournalDetailScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageCarousel: {
    height: height * 0.5,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: width,
    height: height * 0.5,
    resizeMode: 'cover',
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 10,
    height: 10,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 30,
    elevation: 3,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    marginBottom: 16,
    fontFamily:Fonts.Bold
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 12,
  },
  text: {
    fontSize: 15,
    marginTop: 4,
    color: '#444',
    fontFamily:Fonts.Regular
  },
  linkText: {
    color: Colors.primary,
    textDecorationLine: 'underline',
    fontFamily:Fonts.Medium
  },
});
