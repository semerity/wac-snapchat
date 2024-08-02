import React, { useRef } from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';

export default function App() {

    return (
        <View style={styles.container}>
            <MapView style={styles.map}
                showsUserLocation={true}
                zoomEnabled={true}
                showsMyLocationButton={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
        margin: 'auto'
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0
    },
});

