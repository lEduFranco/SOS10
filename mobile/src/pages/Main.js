import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, View, Text, TextInput, TouchableOpacity,  } from  'react-native';
import MapView, {Marker, Callout} from 'react-native-maps';
import  { requestPermissionsAsync , getCurrentPositionAsync} from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';

import api from '../services/api';
import {connect, disconnect} from '../services/socket';


function Main( {navigation} ) {
  const[devs, setDevs] = useState([]);
  const [currentRegion, setcurrentRegion] = useState(null);
  const [techs, setTechs] = useState('');

  useEffect(() =>  {
    async function loadInitialPosition() {
      const { granted } = await requestPermissionsAsync();

      if (granted) {
        const { coords } = await getCurrentPositionAsync({
          enableHighAccuracy: true,
        });

        const {latitude, longitude } = coords;

        setcurrentRegion({
          latitude,
          longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        })
      }
    }
    loadInitialPosition();
  }, []);

  function setupWebsocket() {
    const { latitude, longitude } = currentRegion;

    connect(
      latitude,
      longitude,
      techs,
    );
  }

  async function loadDevs() {
    const { latitude, longitude } = currentRegion;

    const response = await api.get('/search',{
      params: {
        latitude,
        longitude,
        techs
      }
    });

    setDevs(response.data.devs);
    setupWebsocket();
  }

  function handleRegionChanged(region) {
    setcurrentRegion(region);
  }

  if (!currentRegion) {
    return null;
  }

  return ( 
  <> 
    <MapView 
    onRegionChangeComplete={handleRegionChanged} 
    initialRegion={currentRegion} 
    style={style.map} 
    
  >
     {devs.map(dev => (
        <Marker 
        key={dev._id}
      coordinate={{ 
        longitude: dev.location.coordinates[0],
        latitude: dev.location.coordinates[1], 
        
      }}
    >
        <Image 
        style={style.avatar} 
        source={{ uri: dev.avatar_url }}
    />

        <Callout onPress={() => {
          navigation.navigate('Profile', { github_username: dev.github_username })
        }}>
          <View style={style.callout}>
      <Text style={style.devName}>{dev.name}</Text>
      <Text style={style.devBio}>{dev.bio}</Text>
      <Text style={style.devTechs}>{dev.techs.join(', ')}</Text>
          </View>
        </Callout>
      </Marker>))}
    </MapView>
    <View style={style.searchForm}>
      <TextInput
        style={style.searchInput}
        placeholder="Buscar devs por techs..."
        placeholderTextColor="#999"
        autoCapitalize="words"
        autoCorrect={false}
        value={techs}
        onChangeText={setTechs} 
      />
      
      <TouchableOpacity onPress={loadDevs} style={style.loadButton}>
        <MaterialIcons name="my-location" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  </>
  );
}

const style = StyleSheet.create({
  map: {
    flex: 1
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 50,
    borderWidth: 4,
    borderColor:'#fff'
  },

  callout: {
    width: 260,
    //borderRadius: 4,
  },
  devName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  devBio: {
    color: '#666',
    marginTop: 5,
  },

  devTechs: {
    marginTop: 5,
  },
  searchForm: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 5,
    flexDirection: 'row',
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    color: '#333',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 4,
      height: 4,
    },
    elevation: 2, 
  },
  loadButton: {
    width: 50,
    height: 50,
    backgroundColor: '#8e4dff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15, 
  },
})

export default Main;
 