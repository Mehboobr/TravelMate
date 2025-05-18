import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import NewJournalScreen from '../screens/Journal/NewJournalScreen';
import MapScreen from '../screens/Map/MapScreen';
import ProfileScreen from '../screens/ProfileScreen'; // you create this screen
import MapScreen2 from '../screens/Map/MapScreen2';
import Colors from '../constant/colors';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: true,
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: { paddingBottom: 80, paddingTop: 6, height: 90 },
            tabBarIcon: ({ color, size }) => {
                let iconName;

                if (route.name === 'Home') {
                    iconName = 'home-outline';
                } else if (route.name === 'AddJournal') {
                    iconName = 'add-circle-outline';
                } else if (route.name === 'Map') {
                    iconName = 'map-outline';
                } else if (route.name === 'Profile') {
                    iconName = 'person-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
            },
        })}
    >
        <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
                title: 'TravelMate',
                tabBarLabel: 'Home',
                headerTitleAlign: 'center',
                headerTitleStyle: {
                    color: Colors.primary,
                    fontWeight: 'bold',
                    fontSize: 20,
                },

            }}
        />

        <Tab.Screen name="AddJournal" component={NewJournalScreen}
            options={{
                title: 'New Journal Entry',
                tabBarLabel: 'Add Journal',
                headerTitleAlign: 'center',
                headerTitleStyle: {
                    color: Colors.primary,
                    fontWeight: 'bold',
                    fontSize: 20,
                },

            }} />
        <Tab.Screen name="Map" component={MapScreen2} options={{ headerShown: false }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{

            headerTitleAlign: 'center',
            headerTitleStyle: {
                color: Colors.primary,
                fontWeight: 'bold',
                fontSize: 20,
            },

        }} />
    </Tab.Navigator>
);

export default MainTabNavigator;
